"use client";
import React from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../table/table";
import { Play } from "./play";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";

export const Plays = () => (
  <div className="relative flex flex-col h-screen   ">
    <Play />
  </div>
);
