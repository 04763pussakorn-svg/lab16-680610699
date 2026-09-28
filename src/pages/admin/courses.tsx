import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AddCourseDialog } from "@/components/add-course-dialog";
import { RemovableBadge } from "@/components/removable-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
  const { courses, removeCourse, removeInstructor } = useEnrollmentStore();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleConfirmDelete = () => {
    if (courseToDelete) removeCourse(courseToDelete.courseCode);
    setCourseToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่ แล้วไปเลือกลงทะเบียนให้นักศึกษาที่หน้า
          "จัดการการลงทะเบียน"
        </p>
        <AddCourseDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell>{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell>
                  {c.instructors && c.instructors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.instructors.map((name) => (
                        <RemovableBadge
                          key={name}
                          label={name}
                          onRemove={() => removeInstructor(c.courseCode, name)}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`ลบวิชา ${c.courseCode}`}
                    onClick={() => setCourseToDelete(c)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={courseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCourseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ลบวิชา {courseToDelete?.courseCode}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              วิชานี้จะถูกลบออก และจะถูกเอาออกจากรายวิชาของนักศึกษาที่ลงทะเบียนไว้ทุกคน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              ลบวิชา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}