import {
  Button,
  Paper,
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

  const fetchCustomers = (search: string) => {
    const url = search
      ? `/api/customer/list?SearchText=${encodeURIComponent(search)}`
      : `/api/customer/list`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => setList(data as CustomerListItem[]));
  };

  useEffect(() => {
    fetchCustomers(searchText);
  }, [searchText]);

  const exportXml = () => {
    const xmlRows = list.map((row) => `
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
    </Customer>`).join("");

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

      <TextField
        label="Cerca per nome o email"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
        onClick={exportXml}
      >
        Esporta XML
      </Button>

      <TableContainer component={Paper}>
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
            {list.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.iban}</TableCell>
                <TableCell>
                  {row.category
                    ? `${row.category.code} - ${row.category.description}`
                    : "-"}
                </TableCell>
              </TableRow>
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
  },
}));