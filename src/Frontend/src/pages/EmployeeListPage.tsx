import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface EmployeeListItem {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  department?: {
    code: string;
    description: string;
  };
}

type SortField = "firstName" | "lastName" | "email";
type SortDirection = "asc" | "desc";

export default function EmployeeListPage() {
  const [list, setList] = useState<EmployeeListItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("lastName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const fetchEmployees = (search: string) => {
    setLoading(true);
    const url = search
      ? `/api/employees/list?FirstName=${encodeURIComponent(search)}`
      : `/api/employees/list`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setList(data as EmployeeListItem[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees(searchText);
  }, [searchText]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedList = [...list].sort((a, b) => {
    const valA = a[sortField].toLowerCase();
    const valB = b[sortField].toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const exportXml = () => {
    const xmlRows = sortedList
      .map(
        (row) => `
    <Employee>
      <Id>${row.id}</Id>
      <Code>${row.code}</Code>
      <FirstName>${row.firstName}</FirstName>
      <LastName>${row.lastName}</LastName>
      <Address>${row.address}</Address>
      <Email>${row.email}</Email>
      <Phone>${row.phone}</Phone>
      <Department>
        <Code>${row.department?.code ?? ""}</Code>
        <Description>${row.department?.description ?? ""}</Description>
      </Department>
    </Employee>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Employees>${xmlRows}
</Employees>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employees.xml";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Employees
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          label="Cerca per nome"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={exportXml}
          sx={{ whiteSpace: "nowrap", height: 56 }}
        >
          Esporta XML
        </Button>
      </Box>

      {!loading && (
        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
          {list.length === 0
            ? "Nessun risultato trovato"
            : `Trovati ${list.length} dipendenti`}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="employees table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell
                onClick={() => handleSort("firstName")}
                sx={{ cursor: "pointer" }}
              >
                First Name{getSortIndicator("firstName")}
              </StyledTableHeadCell>
              <StyledTableHeadCell
                onClick={() => handleSort("lastName")}
                sx={{ cursor: "pointer" }}
              >
                Last Name{getSortIndicator("lastName")}
              </StyledTableHeadCell>
              <StyledTableHeadCell
                onClick={() => handleSort("email")}
                sx={{ cursor: "pointer" }}
              >
                Email{getSortIndicator("email")}
              </StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
              <StyledTableHeadCell>Department</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton variant="text" animation="wave" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : list.length === 0
              ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      Nessun dipendente trovato per "{searchText}"
                    </TableCell>
                  </TableRow>
                )
              : sortedList.map((row, index) => (
                  <StyledTableRow key={row.id} isEven={index % 2 === 0}>
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell>{row.lastName}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                      {row.department ? (
                        <Chip
                          label={`${row.department.code} - ${row.department.description}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </StyledTableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
}));

const StyledTableRow = styled(TableRow)<{ isEven: boolean }>(
  ({ theme, isEven }) => ({
    backgroundColor: isEven ? theme.palette.action.hover : "inherit",
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
      cursor: "pointer",
    },
    "&:last-child td, &:last-child th": { border: 0 },
  })
);