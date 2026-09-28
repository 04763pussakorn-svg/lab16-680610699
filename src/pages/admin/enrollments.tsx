import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { RemovableBadge } from "@/components/removable-badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };
type StudentOption = Option & { name: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, unenrollStudent } =
    useEnrollmentStore();
  const anchor = useComboboxAnchor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<StudentOption[]>([]);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));
  const studentFilterOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));

  // นักศึกษาที่ยังไม่ได้ลงทะเบียนวิชาที่เลือก (ต้องเลือกวิชาก่อนถึงจะมีตัวเลือก)
  const availableStudents: StudentOption[] = formCourse
    ? students
        .filter((s) => !s.enrolledCourses.includes(formCourse))
        .map((s) => ({
          value: s.studentId,
          label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
          name: `${s.firstName} ${s.lastName}`,
        }))
    : [];

  const handleCourseChange = (courseCode: string) => {
    setFormCourse(courseCode);
    setFormStudents([]); // เปลี่ยนวิชา → ล้างรายชื่อที่เลือกไว้
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(
      formCourse,
      formStudents.map((s) => s.value),
    );
    handleOpenChange(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด (ลงทะเบียนสำเร็จ, กด X, หรือคลิกนอก Dialog)
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  // หนึ่งแถวต่อหนึ่งวิชา
  const rows = courses
    .filter((c) => {
      if (mode === "course") {
        return filterCourse === "all" || c.courseCode === filterCourse;
      }
      if (filterStudent === "all") return true;
      return students.some(
        (s) =>
          s.studentId === filterStudent &&
          s.enrolledCourses.includes(c.courseCode),
      );
    })
    .map((c) => ({
      course: c,
      enrolled: students.filter((s) => s.enrolledCourses.includes(c.courseCode)),
    }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={handleCourseChange}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <Combobox
                multiple
                items={availableStudents}
                value={formStudents}
                onValueChange={(v: StudentOption[]) => setFormStudents(v)}
                itemToStringLabel={(o: StudentOption) => o.label}
                isItemEqualToValue={(a: StudentOption, b: StudentOption) =>
                  a.value === b.value
                }
                disabled={!formCourse}
              >
                <ComboboxChips ref={anchor}>
                  <ComboboxValue>
                    {(values: StudentOption[]) => (
                      <>
                        {values.map((v) => (
                          <ComboboxChip key={v.value}>{v.name}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          placeholder={
                            formCourse ? "เลือกนักศึกษา" : "เลือกวิชาก่อน"
                          }
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
                  <ComboboxList>
                    {(item: StudentOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={formStudents.length === 0} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน
              {formStudents.length > 0 && ` (${formStudents.length} คน)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentFilterOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="text-center">จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map(({ course, enrolled }) => (
              <TableRow key={course.courseCode}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell className="text-center">{enrolled.length}</TableCell>
                <TableCell>
                  {enrolled.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {enrolled.map((s) => (
                        <RemovableBadge
                          key={s.studentId}
                          label={`${s.firstName} ${s.lastName}`}
                          onRemove={() =>
                            unenrollStudent(s.studentId, course.courseCode)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      ยังไม่มีนักศึกษา
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}