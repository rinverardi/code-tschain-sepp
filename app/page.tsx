"use client";

import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  function handleCreate() {
    router.push("pre-game/create");
  }

  function handleJoin() {
    router.push("pre-game/join");
  }

  function handleRead() {
    router.push("rules");
  }

  return <>
    <div className="content--pre-game" id="content">
      <h1>Tschain Sepp</h1>
      <div>
        <button onClick={handleCreate}>Create a Game</button>
        <button onClick={handleJoin}>Join a Game</button>
        <button onClick={handleRead}>Read the Rules</button>
      </div>
    </div>
  </>;
};

export default Page;
