// src/pages/SuppliersReportPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  CircularProgress,
  Box,
} from '@mui/material';
import api from '../services/api';
import NavBarRestrita from '../components/NavBarRestrita';

export default function SuppliersReportPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.get('/suppliers/report');
        setReport(res.data);
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  return (
    <>
      <NavBarRestrita />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Relatório de Fornecedores
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Fornecedor</TableCell>
                  <TableCell>CNPJ</TableCell>
                  <TableCell align="right">Total de Itens</TableCell>
                  <TableCell align="right">QTD Total em Estoque</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.map(row => (
                  <TableRow key={row.supplierId}>
                    <TableCell>{row.supplierName}</TableCell>
                    <TableCell>{row.cnpj}</TableCell>
                    <TableCell align="right">{row.totalItems}</TableCell>
                    <TableCell align="right">{row.totalQuantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
}
