import { Skeleton, TableCell, TableRow } from "@mui/material";

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

export default function TableSkeleton({ rows = 8, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton variant="text" animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}