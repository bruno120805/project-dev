import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  label: string;
  category: "positive" | "neutral" | "negative";
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  title: string;
}

const TagSelector = ({
  tags,
  selectedTags,
  onTagToggle,
  title,
}: TagSelectorProps) => {
  const getTagVariant = (tag: Tag, isSelected: boolean) => {
    if (!isSelected) return "outline";

    switch (tag.category) {
      case "positive":
        return "default";
      case "neutral":
        return "secondary";
      case "negative":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={getTagVariant(tag, isSelected)}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                "px-3 py-1 text-xs font-medium",
                isSelected && "ring-2 ring-offset-1",
                tag.category === "positive" && isSelected && "ring-green-200",
                tag.category === "neutral" && isSelected && "ring-blue-200",
                tag.category === "negative" && isSelected && "ring-red-200",
              )}
              onClick={() => onTagToggle(tag.id)}
            >
              {tag.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default TagSelector;
