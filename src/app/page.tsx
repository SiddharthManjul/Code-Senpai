/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import DevChatInterface from "@/components/chatInterface";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useAccount, useBalance } from 'wagmi';

export default function Home() {
  return (
    <main className="">
      <DynamicWidget />
      <DevChatInterface />
    </main>
  );
}