import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Grid, { GridProps } from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { createContext, ReactNode } from "react";

/** The drag handle for the grid item a widget sits in; widgets render it in their header. */
export const DragHandleContext = createContext<ReactNode>(null);

type SortableItemProps = {
  id: string;
  size: GridProps["size"];
  children: ReactNode;
};

const SortableItem = ({ id, size, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const handle = (
    <IconButton
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      size="small"
      aria-label="Move widget"
      sx={{ cursor: "grab", touchAction: "none", color: "text.secondary" }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        {[4, 8, 12].map((cy) => (
          <g key={cy}>
            <circle cx="6" cy={cy} r="1.3" />
            <circle cx="10" cy={cy} r="1.3" />
          </g>
        ))}
      </svg>
    </IconButton>
  );

  return (
    <Grid
      ref={setNodeRef}
      size={size}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
        opacity: isDragging ? 0.8 : undefined,
      }}
    >
      <DragHandleContext.Provider value={handle}>{children}</DragHandleContext.Provider>
    </Grid>
  );
};

export default SortableItem;
