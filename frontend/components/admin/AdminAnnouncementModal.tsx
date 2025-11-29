// components/admin/AdminAnnouncementModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Sparkles, Gift, Star, Heart, Bell, Tag, Eye } from "lucide-react";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: any;
  onSave: (data: any) => void;
}

const iconOptions = [
  { value: "zap", label: "Zap", icon: Zap },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
  { value: "gift", label: "Gift", icon: Gift },
  { value: "star", label: "Star", icon: Star },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "bell", label: "Bell", icon: Bell },
  { value: "tag", label: "Tag", icon: Tag },
];

export default function AdminAnnouncementModal({
  isOpen,
  onClose,
  announcement,
  onSave,
}: AnnouncementModalProps) {
  const [formData, setFormData] = useState({
    text: "",
    isActive: true,
    startDate: "",
    endDate: "",
    backgroundColor: "#FD0002",
    textColor: "#ffffff",
    icon: "zap",
    link: "",
    priority: 1,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (announcement) {
      setFormData({
        text: announcement.text || "",
        isActive: announcement.isActive ?? true,
        startDate: announcement.startDate
          ? new Date(announcement.startDate).toISOString().split("T")[0]
          : "",
        endDate: announcement.endDate
          ? new Date(announcement.endDate).toISOString().split("T")[0]
          : "",
        backgroundColor: announcement.backgroundColor || "#FD0002",
        textColor: announcement.textColor || "#ffffff",
        icon: announcement.icon || "zap",
        link: announcement.link || "",
        priority: announcement.priority || 1,
      });
    } else {
      setFormData({
        text: "",
        isActive: true,
        startDate: "",
        endDate: "",
        backgroundColor: "#FD0002",
        textColor: "#ffffff",
        icon: "zap",
        link: "",
        priority: 1,
      });
    }
    setErrors({});
  }, [announcement, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.text.trim()) {
      newErrors.text = "Announcement text is required";
    } else if (formData.text.length > 200) {
      newErrors.text = "Announcement text cannot exceed 200 characters";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: any = {
      text: formData.text.trim(),
      isActive: formData.isActive,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      icon: formData.icon,
      priority: formData.priority,
    };

    if (formData.link.trim()) {
      submitData.link = formData.link.trim();
    }

    if (formData.startDate) {
      submitData.startDate = formData.startDate;
    }

    if (formData.endDate) {
      submitData.endDate = formData.endDate;
    }

    onSave(submitData);
  };

  const SelectedIcon = iconOptions.find((opt) => opt.value === formData.icon)?.icon || Zap;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            {announcement ? "Edit Announcement" : "Create New Announcement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4 text-gray-600">
          {/* Announcement Text */}
          <div className="space-y-2">
            <Label htmlFor="text" className="text-sm font-bold text-gray-700">
              Announcement Text <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="text"
              value={formData.text}
              onChange={(e) => handleChange("text", e.target.value)}
              placeholder="Enter your announcement text (max 200 characters)"
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <div className="flex justify-between text-xs">
              {errors.text && <span className="text-red-600">{errors.text}</span>}
              <span className="text-gray-500 ml-auto">
                {formData.text.length}/200 characters
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Label>
            <div
              className="p-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: formData.backgroundColor,
              }}
            >
              <SelectedIcon className="w-5 h-5" style={{ color: formData.textColor }} />
              <span className="font-bold text-sm" style={{ color: formData.textColor }}>
                {formData.text || "Your announcement will appear here"}
              </span>
              <SelectedIcon className="w-5 h-5" style={{ color: formData.textColor }} />
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label htmlFor="icon" className="text-sm font-bold text-gray-700">
              Icon
            </Label>
            <Select value={formData.icon} onValueChange={(value) => handleChange("icon", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor" className="text-sm font-bold text-gray-700">
                Background Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="flex-1"
                  placeholder="#FD0002"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor" className="text-sm font-bold text-gray-700">
                Text Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          {/* Link (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-bold text-gray-700">
              Link (Optional)
            </Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="https://example.com/sale"
            />
            <p className="text-xs text-gray-500">
              If provided, clicking the announcement will navigate to this URL
            </p>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-bold text-gray-700">
                Start Date (Optional)
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-bold text-gray-700">
                End Date (Optional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
              {errors.endDate && (
                <span className="text-xs text-red-600">{errors.endDate}</span>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
              className="mt-1"
            />
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                Active Status
              </Label>
              <p className="text-xs text-gray-500">
                {formData.isActive
                  ? "✓ Announcement is visible to users"
                  : "✗ Announcement is hidden from users"}
              </p>
            </div>
          </div>

          {/* Priority (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-bold text-gray-700">
              Priority
            </Label>
            <Input
              id="priority"
              type="number"
              min="1"
              value={formData.priority}
              onChange={(e) => handleChange("priority", parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-gray-500">
              Lower numbers appear first in rotation
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold"
            >
              {announcement ? "Update Announcement" : "Create Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}