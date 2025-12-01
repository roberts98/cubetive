/**
 * SolveRow Component
 *
 * Displays a single solve record in the history table with time, date, scramble, and delete action.
 */

import { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { SolveDTO } from '../types/timer.types';
import { formatSolveTime } from '../utils/formatTime';

interface SolveRowProps {
  solve: SolveDTO;
  onDelete: (solveId: string) => void;
  isDeleting: boolean;
}

/**
 * Formats a date string to a human-readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SolveRow({ solve, onDelete, isDeleting }: SolveRowProps) {
  const [scrambleDialogOpen, setScrambleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(solve.id);
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleScrambleClick = () => {
    setScrambleDialogOpen(true);
  };

  const handleScrambleClose = () => {
    setScrambleDialogOpen(false);
  };

  return (
    <>
      <TableRow hover>
        {/* Time with penalty indicator */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatSolveTime(solve.time_ms, solve.penalty_type)}
            </Typography>
            {solve.penalty_type && (
              <Chip
                label={solve.penalty_type}
                size="small"
                color={solve.penalty_type === 'DNF' ? 'error' : 'warning'}
              />
            )}
          </Box>
        </TableCell>

        {/* Date and time */}
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatDate(solve.created_at)}
          </Typography>
        </TableCell>

        {/* Scramble (with view button) */}
        <TableCell>
          <IconButton
            size="small"
            onClick={handleScrambleClick}
            aria-label="View scramble"
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>
        </TableCell>

        {/* Delete button */}
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label="Delete solve"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Scramble Dialog */}
      <Dialog open={scrambleDialogOpen} onClose={handleScrambleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Scramble</DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              wordBreak: 'break-word',
            }}
          >
            {solve.scramble}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Time: {formatSolveTime(solve.time_ms, solve.penalty_type)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Date: {formatDate(solve.created_at)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScrambleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Solve?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this solve? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Time: {formatSolveTime(solve.time_ms, solve.penalty_type)}
            <br />
            Date: {formatDate(solve.created_at)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={isDeleting} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
