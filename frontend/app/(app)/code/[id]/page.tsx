import Navbar from "@/components/editor/navbar";
import { Room } from "@/components/editor/live/room";
import { TFile, TFolder } from "@/components/editor/sidebar/types";
import { R2Files, User, UsersToVirtualboxes, Virtualbox } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";

const CodeEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

const getUserData = async (id: string) => {
  const userRes = await fetch(
    `https://database.cestorage.workers.dev/api/user?id=${id}`
  );
  const userData = (await userRes.json()) as User;
  return userData;
};

const getVirtualboxData = async (id: string) => {
  const virtualboxRes = await fetch(
    `https://database.cestorage.workers.dev/api/virtualbox?id=${id}`
  );
  const virtualboxData: Virtualbox = await virtualboxRes.json();
  return virtualboxData;
};

const getSharedUsers = async (usersToVirtualboxes: UsersToVirtualboxes[]) => {
  const shared = await Promise.all(
    usersToVirtualboxes?.map(async (user) => {
      const userRes = await fetch(
        `https://database.cestorage.workers.dev/api/user?id=${user.userId}`
      );
      const userData: User = await userRes.json();
      return { id: userData.id, name: userData.name };
    })
  );
  return shared;
};

export default async function CodePage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const virtualboxId = params.id;

  if (!user) {
    redirect("/");
  }

  const userData = await getUserData(user.id);
  const virtualboxData = await getVirtualboxData(virtualboxId);
  const shared = await getSharedUsers(virtualboxData.usersToVirtualboxes ?? []);

  const isOwner = virtualboxData.userId === user.id;
  const isSharedUser = shared.some((utv) => utv.id === user.id);

  if (!isOwner && !isSharedUser) {
    return notFound();
  }
  const user1: User = {
    id: "user-123",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    generations: 5,
    virtualbox: [
      {
        id: "1",
        name: "jay",
        type: "react",
        visibility: "public" ,
        userId: "2",
        usersToVirtualboxes: [
          {
            userId: "3",
  virtualboxId: "1",
          }
        ]
        
      },
      

    ],
    usersToVirtualboxes: [
      {
        userId: "3",
virtualboxId: "1",
      }
    ]
    
  };
  let virtualbox1:Virtualbox = {
    id: "98",
    name: "23",
    type: "react",
    visibility: "public",
    userId: "23",
    usersToVirtualboxes:[
      {
        userId: "3",
virtualboxId: "1",
      }
    ],
  };
  return (
    <div className="overflow-hidden overscroll-none w-screen flex flex-col h-screen bg-background">
      <Room id={virtualboxId}>
      <Navbar
          userData={userData}
          virtualboxData={virtualboxData}
          shared={shared}
        />
        <div className="w-screen flex grow">
          <CodeEditor
            userData={userData}
            virtualboxData={virtualboxData}
            isSharedUser={isSharedUser}
          />
        </div>
      </Room>
    </div>
  );
}
