import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import { Plus, Trash2, Edit2, Package, Sparkles, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';

const INDUSTRIES = [
  'Software / SaaS',
  'FinTech',
  'E-commerce',
  'Healthcare Technology',
  'Education Technology',
  'Artificial Intelligence',
  'Cybersecurity',
  'Other',
];

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Software / SaaS');
  const [featuresText, setFeaturesText] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [customerSummary, setCustomerSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditProduct(null);
    setName('');
    setDescription('');
    setIndustry('Software / SaaS');
    setFeaturesText('');
    setProblemSolved('');
    setCustomerSummary('');
    setErrorMessage('');
    setOpenModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setDescription(p.description);
    setIndustry(p.industry);
    setFeaturesText(p.features?.join('\n') || '');
    setProblemSolved(p.problem_solved || '');
    setCustomerSummary(p.target_customer_summary || '');
    setErrorMessage('');
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      fetchProducts();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name: name.trim(),
        description: description.trim() || `${name.trim()} - enterprise solution`,
        industry,
        features: features.length > 0 ? features : ['Core service feature'],
        problem_solved: problemSolved.trim() || 'Boosts customer efficiency and automates key workflows',
        target_customer_summary: customerSummary.trim() || 'Sri Lankan business owners and operational teams',
      };

      if (editProduct) {
        await api.updateProduct(editProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setOpenModal(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMessage(detail.map((d: any) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', '));
      } else if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else {
        setErrorMessage('Failed to save product. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0f172a' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', py: 3, px: { xs: 2, md: 3 } }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#000000', letterSpacing: '-0.025em', mb: 0.5 }}>
            Technology Products &amp; Services (FR1)
          </Typography>
          <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.925rem', fontWeight: 500 }}>
            Maintain product catalog, technical features, and solved problems for marketing strategy assessments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Plus size={16} color="#14532d" />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: 9999,
            bgcolor: '#bef264',
            color: '#14532d',
            fontWeight: 700,
            px: 3,
            py: 1,
            '&:hover': { bgcolor: '#a3e635' },
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Empty State */}
      {products.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', borderRadius: '24px', border: '1px solid #eef2f6', bgcolor: '#ffffff' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Package size={32} color="#000000" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#000000', mb: 1 }}>
            No Products Registered
          </Typography>
          <Typography variant="body2" sx={{ color: '#000000', mb: 3, maxWidth: 480, mx: 'auto', fontWeight: 500 }}>
            Register your software product or tech service to begin generating customer-oriented marketing strategies.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenCreate}
            sx={{ borderRadius: 9999, bgcolor: '#bef264', color: '#14532d', fontWeight: 700, px: 3 }}
          >
            Register First Product
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {products.map((prod) => (
            <Grid size={{ xs: 12, md: 6 }} key={prod.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3.5 }}>
                  {/* Card Title & Industry */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#000000', letterSpacing: '-0.02em' }}>
                      {prod.name}
                    </Typography>
                    <Chip
                      label={prod.industry}
                      size="small"
                      sx={{
                        bgcolor: '#f1f5f9',
                        color: '#000000',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#000000', mb: 2.5, lineHeight: 1.6, fontSize: '0.9rem', fontWeight: 500 }}>
                    {prod.description}
                  </Typography>

                  {/* Features */}
                  <Typography variant="caption" sx={{ color: '#000000', fontWeight: 800, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Main Features:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2.5 }}>
                    {(prod.features || []).map((feat, idx) => (
                      <Chip
                        key={idx}
                        label={feat}
                        size="small"
                        sx={{
                          bgcolor: '#f8fafc',
                          color: '#000000',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>

                  {/* Problem Solved & Target Customer */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: '#000000', fontWeight: 800, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Problem Solved:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 500 }}>
                        {prod.problem_solved}
                      </Typography>
                    </Box>

                    {prod.target_customer_summary && (
                      <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Target size={16} color="#000000" />
                        <Typography variant="caption" sx={{ color: '#000000', fontWeight: 700 }}>
                          Target: {prod.target_customer_summary}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 3.5, pb: 3, pt: 0, justifyContent: 'space-between', borderTop: '1px solid #f8fafc', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(prod)} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(prod.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    endIcon={<ArrowRight size={15} color="#14532d" />}
                    onClick={() => navigate(`/wizard?product_id=${prod.id}`)}
                    sx={{
                      borderRadius: 9999,
                      bgcolor: '#bef264',
                      color: '#14532d',
                      fontWeight: 700,
                      px: 2.5,
                      py: 0.6,
                      '&:hover': { bgcolor: '#a3e635' },
                    }}
                  >
                    Run Assessment
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal Dialog for Create/Edit */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#000000', fontSize: '1.25rem', pt: 3, px: 3 }}>
          {editProduct ? 'Edit Technology Product' : 'Register New Technology Product'}
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, py: 2.5, borderColor: '#f1f5f9' }}>
          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Product or Service Name (Q1)"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apex Cloud ERP"
          />

          <TextField
            select
            label="Industry Category (Q4)"
            fullWidth
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {INDUSTRIES.map((ind) => (
              <MenuItem key={ind} value={ind}>
                {ind}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Product Description (Q2)"
            fullWidth
            multiline
            rows={3}
            required
            helperText="Explain what your product does, main capabilities, and technical architecture."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cloud ERP tailored for Sri Lankan retail and wholesale distributors with automated VAT compliance."
          />

          <TextField
            label="Technical Features (Q3: One feature per line)"
            fullWidth
            multiline
            rows={3}
            required
            helperText="Enter repeatable technical capabilities (e.g., Inventory Sync, POS Integration, VAT Compliance)."
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="Inventory Sync&#10;POS Integration&#10;Automated VAT Invoicing"
          />

          <TextField
            label="Main Problem Solved"
            fullWidth
            required
            helperText="What customer operational bottleneck or pain point does this product eliminate?"
            value={problemSolved}
            onChange={(e) => setProblemSolved(e.target.value)}
            placeholder="Reduces daily bookkeeping from 3 hours to 10 minutes without manual calculation errors."
          />

          <TextField
            label="Target Customer Summary"
            fullWidth
            required
            helperText="Briefly describe the primary buyers (e.g. Retail store owners and SME finance managers)."
            value={customerSummary}
            onChange={(e) => setCustomerSummary(e.target.value)}
            placeholder="Retail store owners, wholesale traders, and small enterprise finance managers."
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, px: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenModal(false)} sx={{ borderRadius: 9999, color: '#64748b' }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleSave}
            disabled={submitting}
            sx={{
              borderRadius: 9999,
              bgcolor: '#bef264',
              color: '#14532d',
              fontWeight: 700,
              px: 3.5,
              py: 0.9,
              '&:hover': { bgcolor: '#a3e635' },
            }}
          >
            {submitting ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
