import React from 'react';
import {Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { prettyPrintDate } from '../../utils/dates';

const HistoricalValuesTable = ({
  values
}) => (
  <Container>
    {
      values &&
      <TableContainer component={Paper} style={{marginTop: 20, maxHeight: 575}}>
        <Table sx={{minWidth: 400}}>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Download avg (mbps)</TableCell>
              <TableCell>Upload avg (mbps)</TableCell>
              <TableCell>Latency (ms)</TableCell>
              <TableCell>Packet loss (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              values.map((value, index) => (
                <TableRow key={index}>
                  <TableCell>{prettyPrintDate(value.timestamp)}</TableCell>
                  <TableCell align={'center'}>{value.download.toFixed(3)}</TableCell>
                  <TableCell align={'center'}>{value.upload.toFixed(3)}</TableCell>
                  <TableCell align={'center'}>{value.latency.toFixed(0)}</TableCell>
                  <TableCell align={'center'}>{value.loss.toFixed(2)}</TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
    }
    {
      !values &&
      <p>No historical values registered. Run a test first!</p>
    }
  </Container>
);

export default HistoricalValuesTable;