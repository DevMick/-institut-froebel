import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const TypeReunionReunionsPage = () => {
  const { user, logout } = useAuth();
  const { typeReunionId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [typeReunion, setTypeReunion] = useState(null);
  const [reunions, setReunions] = useState([]);
  const [statistiques, setStatistiques] = useState({
    totalReunions: 0,
    reunionsPassees: 0,
    reunionsFutures: 0,
  });
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
  });
  const [loading, setLoading] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      enqueueSnackbar('Votre session a expiré. Veuillez vous reconnecter.', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      logout();
      navigate('/login');
    } else {
      throw error;
    }
  };

  useEffect(() => {
    if (user?.clubId) {
      fetchReunions();
    }
  }, [user?.clubId, typeReunionId, pagination.page, pagination.pageSize, filters]);

  const fetchReunions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page + 1,
        pageSize: pagination.pageSize,
      });

      if (filters.dateDebut) {
        params.append('dateDebut', new Date(filters.dateDebut).toISOString());
      }
      if (filters.dateFin) {
        params.append('dateFin', new Date(filters.dateFin).toISOString());
      }

      const response = await axios.get(
        `/api/clubs/${user.clubId}/types-reunion/${typeReunionId}/reunions?${params}`
      );

      setTypeReunion(response.data.typeReunion);
      setReunions(response.data.reunions);
      setStatistiques(response.data.statistiques);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      handleAuthError(error);
      enqueueSnackbar('Erreur lors du chargement des réunions', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleRowsPerPageChange = (event) => {
    setPagination({
      ...pagination,
      page: 0,
      pageSize: parseInt(event.target.value, 10),
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, page: 0 });
  };

  const handleViewReunion = (reunionId) => {
    navigate(`/clubs/${user.clubId}/reunions/${reunionId}`);
  };

  if (!user?.clubId) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={handleSidebarToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${sidebarCollapsed ? 64 : 240}px)` },
            ml: { sm: `${sidebarCollapsed ? 64 : 240}px` },
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h6" color="error">
              Vous n'avez pas de club assigné. Veuillez contacter un administrateur.
            </Typography>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={handleSidebarToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarCollapsed ? 64 : 240}px)` },
          ml: { sm: `${sidebarCollapsed ? 64 : 240}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* En-tête */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/clubs/${user.clubId}/types-reunion`)}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1">
                  Réunions - {typeReunion?.libelle}
                </Typography>
              </Box>
            </Grid>

            {/* Filtres */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Date de début"
                        type="date"
                        fullWidth
                        value={filters.dateDebut}
                        onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Date de fin"
                        type="date"
                        fullWidth
                        value={filters.dateFin}
                        onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistiques */}
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total des Réunions
                      </Typography>
                      <Typography variant="h4">
                        {statistiques.totalReunions}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Réunions Passées
                      </Typography>
                      <Typography variant="h4">
                        {statistiques.reunionsPassees}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Réunions Futures
                      </Typography>
                      <Typography variant="h4">
                        {statistiques.reunionsFutures}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Liste des réunions */}
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Ordres du Jour</TableCell>
                      <TableCell align="center">Présences</TableCell>
                      <TableCell align="center">Invités</TableCell>
                      <TableCell align="center">Documents</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reunions.map((reunion) => (
                      <TableRow key={reunion.id}>
                        <TableCell>
                          {new Date(reunion.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <DescriptionIcon sx={{ mr: 1 }} />
                            {reunion.nombreOrdresDuJour}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <PeopleIcon sx={{ mr: 1 }} />
                            {reunion.nombrePresences}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <PersonAddIcon sx={{ mr: 1 }} />
                            {reunion.nombreInvites}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <AttachFileIcon sx={{ mr: 1 }} />
                            {reunion.nombreDocuments}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleViewReunion(reunion.id)}
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={pagination.total}
                  page={pagination.page}
                  onPageChange={handlePageChange}
                  rowsPerPage={pagination.pageSize}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Lignes par page"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} sur ${count}`
                  }
                />
              </TableContainer>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default TypeReunionReunionsPage; 