"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import QuizClass from "@/types/QuizClass"
import iconMap from "@/lib/iconMap"
import { useRouter } from "next/navigation"
import { MdOutlineCancel } from "react-icons/md"
import { IoMdCreate } from "react-icons/io"
import { toast } from "sonner"

export default function AddClassForm() {
    const [classId, setClassId] = useState("")
    const [className, setClassName] = useState("")
    const [visibility, setVisibility] = useState(false)
    const [classIcon, setClassIcon] = useState("default")
    const [jsonData, setJsonData] = useState("")
    const [isJsonMode, setIsJsonMode] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        let data

        if (isJsonMode) {
            try {
                data = JSON.parse(jsonData)
            } catch (error) {
                console.error("Invalid JSON:", error)
                toast.error("Invalid JSON data. Please check and try again.")
                return
            }
        } else {
            data = {
                id: classId,
                name: className,
                visibility: visibility,
                icon: classIcon,
            } as QuizClass
        }

        try {
            const response = await fetch("/api/admin/class", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success("Class created successfully 🎉")
                router.push("/admin/dashboard")
            } else {
                throw new Error(`Failed to create class`)
            }
        } catch (error) {
            console.error(`Error creating class:`, error)
            toast.error(`Failed to create class. Please try again.`)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="input-mode">Input Mode:</Label>
                    <Button type="button" variant={isJsonMode ? "outline" : "default"} onClick={() => setIsJsonMode(false)}>
                        Form
                    </Button>
                    <Button type="button" variant={isJsonMode ? "default" : "outline"} onClick={() => setIsJsonMode(true)}>
                        JSON
                    </Button>
                </div>
                {isJsonMode ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Example:</Label>
                            <pre className="bg-gray-100 p-2 rounded">
                                {`{
  "id": "web-development",
  "name": "Web Development",
  "visibility": true,
  "icon": "FaCode"
}`}
                            </pre>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="json-data">JSON Data</Label>
                            <Textarea
                                id="json-data"
                                value={jsonData}
                                onChange={(e) => setJsonData(e.target.value)}
                                placeholder="Enter JSON data for the new class"
                                rows={10}
                                required
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="class-id">Class ID</Label>
                            <Input
                                id="class-id"
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                placeholder="Enter class ID (e.g., web-development)"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class-name">Class Name</Label>
                            <Input
                                id="class-name"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                placeholder="Enter class name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class-icon" className="flex gap-1 items-center">Class Icon {iconMap["default"]}</Label>
                            <Input
                                id="class-icon"
                                value={classIcon}
                                onChange={(e) => setClassIcon(e.target.value)}
                                placeholder="Enter class icon"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="class-visibility">Visible to Users</Label>
                                <Switch id="class-visibility" checked={visibility} onCheckedChange={setVisibility} />
                            </div>
                            <p className="text-sm text-gray-500">
                                {visibility ? "This class will be visible to all users" : "This class will be hidden from users"}
                            </p>
                        </div>
                    </>
                )}
                <div className="flex justify-between">
                    <Button variant={"outline"} onClick={() => router.push("/admin/dashboard")}>Cancel <MdOutlineCancel /></Button>
                    <Button type="submit">
                        Create Class <IoMdCreate />
                    </Button>
                </div>
            </div>
        </form>
    )
}

