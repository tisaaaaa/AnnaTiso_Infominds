import {
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
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";

interface CustomerListItem {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
  category?: {
    code: string;
    description: string;
  };
}

export default function CustomerListPage() {
  const [list, setList] = useState<CustomerListItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = (search: string) => {
    setLoading(true);
    const url = search
      ? `/api/customer/list?SearchText=${encodeURIComponent(search)}`
      : `/api/customer/list`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setList(data as CustomerListItem[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers(searchText);
  }, [searchText]);

  const exportXml = () => {
    const xmlRows = list
      .map(
        (row) => `
    <Customer>
      <Id>${row.id}</Id>
      <Name>${row.name}</Name>
      <Address>${row.address}</Address>
      <Email>${row.email}</Email>
      <Phone>${row.phone}</Phone>
      <Iban>${row.iban}</Iban>
      <Category>
        <Code>${row.category?.code ?? ""}</Code>
        <Description>${row.category?.description ?? ""}</Description>
      </Category>
    </Customer>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Customers>${xmlRows}
</Customers>`;

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.xml";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Customers
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          label="Cerca per nome o email"
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
            : `Trovati ${list.length} clienti`}
        </Typography>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="customers table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
              <StyledTableHeadCell>Iban</StyledTableHeadCell>
              <StyledTableHeadCell>Category</StyledTableHeadCell>
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
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                      Nessun cliente trovato per "{searchText}"
                    </TableCell>
                  </TableRow>
                )
              : list.map((row, index) => (
                  <StyledTableRow key={row.id} isEven={index % 2 === 0}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.iban}</TableCell>
                    <TableCell>
                      {row.category ? (
                        <Chip
                          label={`${row.category.code} - ${row.category.description}`}
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

const StyledTableRow = styled(TableRow)<{ isEven: boolean }>(({ theme, isEven }) => ({
  backgroundColor: isEven ? theme.palette.action.hover : "inherit",
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    cursor: "pointer",
  },
  "&:last-child td, &:last-child th": { border: 0 },
}));