// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.13;

/**
 * @dev A call to an address target failed. The target may have reverted.
 */
error FailedInnerCall();

interface IERC20Like {
  function balanceOf(address account) external view returns(uint256);
  function totalSupply() external view returns(uint256);
  function decimals() external view returns(uint8);
  function approve(address spender, uint256 value) external returns(bool);
  function transferFrom(address from, address to, uint256 value) external returns(bool);
}

contract DAO {
  event ProposalCreated(uint256 indexed proposalId, string description);
  event Vote(uint256 indexed proposalId, address indexed voter, uint256 amount);
  event ExecuteProposal(uint256 indexed proposalId);
  event VoteCast(address indexed voter, uint256 indexed proposalId, uint256 amount);
  event ProposalExecuted(uint256 indexed proposalId);
  event Claimed(uint256 indexed proposalId, address indexed account, uint256 amount);

  struct Proposal {
    string description;
    bool executed;
    uint256 total;
    uint256 deadline;
    address creator;

    /** proposal execute */
    address target; // contract to execute
    bytes data; // funcSig + param

    uint256 reward;
  }

  uint256 public constant DEADLINE_BLOCK = 200; // 10 min (3block/s)

  Proposal[] internal _proposals;

  uint256 internal _minThreshold; // % total supply, 1% => 0.01 => 10**18 * 0.01

  // proposalId => account => voteCount(tokenBalance)
  mapping(uint256 => mapping(address => uint256)) internal _votes;
  mapping(uint256 => mapping(address => uint256)) internal _claims;

  address internal _govToken;

  address internal _treasury;

  constructor(address treasury_, address govToken_, uint256 minThreshold_) {
    _treasury = treasury_;
    _govToken = govToken_;
    _minThreshold = minThreshold_;
  }

  function proposalOf(uint256 _proposalId) public view returns(Proposal memory) {
    return _proposals[_proposalId];
  }

  function totalProposal() public view returns(uint256) {
    return _proposals.length;
  }

  function minThreshold() public view returns(uint256) {
    return _minThreshold;
  }

  function voteOf(uint256 _proposalId, address _account) public view returns(uint256) {
    return _votes[_proposalId][_account];
  }

  function claimOf(uint256 _proposalId, address _account) public view returns(uint256) {
    return _claims[_proposalId][_account];
  }

  function govToken() public view returns(address) {
    return _govToken;
  }

  function rewardOf(uint256 _proposalId, address _user) public view returns(uint256) {
    if (_proposalId >= _proposals.length) {
      return 0;
    }

    if (_proposals[_proposalId].executed) {
      uint256 totalReward = _proposals[_proposalId].reward;
      uint256 totalVote = _proposals[_proposalId].total;

      return totalReward * _votes[_proposalId][_user] / totalVote;
    }

    return 0;
  }

  function treasury() public view returns(address) {
    return _treasury;
  }

  /**
   * claim token locked in DAO
   */
  function claim(uint256 _proposalId) public {
    require(_proposalId < _proposals.length, "Invalid proposal id");
    require(_votes[_proposalId][msg.sender] > 0, "No votes");
    require(_proposals[_proposalId].deadline <= block.number, "Token is locking");

    // executed
    if (_proposals[_proposalId].executed) {
      require(_claims[_proposalId][msg.sender] == 0, "Already claimed");

      uint256 reward = rewardOf(_proposalId, msg.sender);
      uint256 totalReturn = reward + _votes[_proposalId][msg.sender];

      _claims[_proposalId][msg.sender] = totalReturn;
      require(IERC20Like(_govToken).transferFrom(treasury(), msg.sender, totalReturn), "Transfer failed");
      emit Claimed(_proposalId, msg.sender, totalReturn);
    } else {
      // refund
      uint256 totalReturn  = _votes[_proposalId][msg.sender];
      _claims[_proposalId][msg.sender] = totalReturn;
      require(IERC20Like(_govToken).transferFrom(treasury(), msg.sender, totalReturn), "Transfer failed");

      emit Claimed(_proposalId, msg.sender, totalReturn);
    }
  }

  function createProposal(string memory _description, address _target, bytes memory _data, uint256 _reward) public {
    _proposals.push(Proposal({
      description: _description,
      total: 0,
      executed: false,
      deadline: block.number + DEADLINE_BLOCK,
      creator: msg.sender,

      target: _target,
      data: _data,
      reward: _reward
    }));

    // lock token as reward
    require(IERC20Like(_govToken).transferFrom(msg.sender, treasury(), _reward), "Transfer failed");
    IERC20Like(_govToken).approve(treasury(), _reward);

    emit ProposalCreated(_proposals.length - 1, _description);
  }

  function vote(uint256 _proposalId, uint256 _tokenAmount) public {
    require(_proposalId < _proposals.length, "Invalid proposalId");
    require(_proposals[_proposalId].executed == false, "Already executed");
    require(_proposals[_proposalId].deadline > block.number, "Already expired");
    require(IERC20Like(_govToken).balanceOf(msg.sender) >= _tokenAmount, "Not enough tokens");

    _votes[_proposalId][msg.sender] += _tokenAmount;
    _proposals[_proposalId].total += _tokenAmount;

    // need lock token to vote
    require(IERC20Like(_govToken).transferFrom(msg.sender, treasury(), _tokenAmount), "Transfer failed");
    IERC20Like(_govToken).approve(treasury(), _tokenAmount);

    emit VoteCast(msg.sender, _proposalId, _tokenAmount);

    bool _voteReachThreshold = reachThreshold(_proposalId);
    if (_voteReachThreshold) {
      _executeProposal(_proposalId);
    }
  }

  function reachThreshold(uint256 _proposalId) public view returns(bool) {
    if (_proposalId >= _proposals.length) return false;

    Proposal storage p = _proposals[_proposalId];
    
    // total / supply > minThreshold / 100 * decimal
    // example: supply 100k * decimal,
    // minThreshold 1% => 100k * decimal * 0.01
    // total must be >= 100k * decimal * 0.01
    uint256 total = p.total;

    if (total >= _minThreshold * IERC20Like(_govToken).totalSupply() / (10 ** IERC20Like(_govToken).decimals())) {
      return true;
    }

    return false;
  }

  function _executeProposal(uint256 _proposalId) internal returns(bytes memory) {
    _proposals[_proposalId].executed = true;

    Proposal storage p = _proposals[_proposalId];
    (bool success, bytes memory returndata) = p.target.call(p.data);
    if (!success) {
      // revert
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly
        /// @solidity memory-safe-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert FailedInnerCall();
      }
    } else {
      emit ProposalExecuted(_proposalId);
      return returndata;
    }
  }
}