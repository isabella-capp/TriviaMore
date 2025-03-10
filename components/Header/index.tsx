import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaHome } from "react-icons/fa";
import { useState, useEffect } from "react";
import Cookies from "js-cookie"

export default function Header() {
  const [username, setUsername] = useState<String | null>(null)

  useEffect(() => {
    const user = Cookies.get("admin_username")
    if (user) {
      setUsername(user)
    }
  }, [])

  return (
    <header className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Trivia More
        </Link>
        <nav className="flex gap-4 items-center">
          {username && <Link className="underline-offset-4 hover:underline" href={"/admin/dashboard"}>{`< ${username} />`}</Link>}
          <Button asChild variant="ghost">
            <Link href="/">Home <FaHome /></Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

