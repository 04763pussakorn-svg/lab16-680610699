import { useState } from "react";
import { PlusCircle } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type InstructorOption = { value: string; label: string; isNew?: boolean };

export function AddCourseDialog() {
  const { courses, addCourse } = useEnrollmentStore();
  const anchor = useComboboxAnchor();

  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selected, setSelected] = useState<InstructorOption[]>([]);
  const [query, setQuery] = useState("");
  const [createdNames, setCreatedNames] = useState<string[]>([]); // ผู้สอนใหม่ที่พิมพ์เพิ่มใน dialog นี้

  // ชื่อผู้สอนที่มีอยู่แล้วในทุกวิชา (ไม่ซ้ำกัน) + ที่เพิ่งพิมพ์เพิ่ม
  const allNames = [
    ...new Set([...courses.flatMap((c) => c.instructors ?? []), ...createdNames]),
  ];
  const q = query.trim();
  const visible: InstructorOption[] = allNames
    .filter((n) => n.toLowerCase().includes(q.toLowerCase()))
    .map((n) => ({ value: n, label: n }));
  const hasExact = allNames.some((n) => n.toLowerCase() === q.toLowerCase());
  if (q && !hasExact) {
    visible.push({ value: q, label: `+ เพิ่มผู้สอน "${q}"`, isNew: true });
  }

  // รหัสวิชาซ้ำ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
  const code = courseCode.trim();
  const duplicate = code
    ? courses.find((c) => c.courseCode.toLowerCase() === code.toLowerCase())
    : undefined;
  const canSave = code !== "" && courseTitle.trim() !== "" && !duplicate;

  const reset = () => {
    setCourseCode("");
    setCourseTitle("");
    setSelected([]);
    setQuery("");
    setCreatedNames([]);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleInstructorsChange = (next: InstructorOption[]) => {
    const created = next.find((o) => o.isNew);
    if (created) {
      // เลือกตัวเลือก "+ เพิ่มผู้สอน" → เปลี่ยนเป็นชื่อจริง และเก็บไว้เป็นตัวเลือก
      const name = created.value;
      setCreatedNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
      next = next.map((o) => (o.isNew ? { value: name, label: name } : o));
    }
    setSelected(next);
    setQuery("");
  };

  const handleSave = () => {
    if (!canSave) return;
    addCourse({
      courseCode: code.toUpperCase(),
      courseTitle: courseTitle.trim(),
      instructors: selected.map((o) => o.value),
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
          <DialogDescription>
            วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="courseCode">รหัสวิชา</Label>
            <Input
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              aria-invalid={!!duplicate}
            />
            {duplicate && (
              <p className="text-sm text-destructive">
                มีรหัสวิชา {duplicate.courseCode} นี้แล้ว
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="courseTitle">ชื่อวิชา</Label>
            <Input
              id="courseTitle"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>ผู้สอน</Label>
            <Combobox
              multiple
              items={visible}
              filter={null}
              value={selected}
              onValueChange={handleInstructorsChange}
              inputValue={query}
              onInputValueChange={setQuery}
              isItemEqualToValue={(a, b) => a.value === b.value}
            >
              <ComboboxChips ref={anchor}>
                <ComboboxValue>
                  {(values: InstructorOption[]) => (
                    <>
                      {values.map((v) => (
                        <ComboboxChip key={v.value}>{v.label}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput placeholder="เลือกหรือพิมพ์ชื่อผู้สอน" />
                    </>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
                <ComboboxList>
                  {(item: InstructorOption) => (
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
          <Button disabled={!canSave} onClick={handleSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}