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
} from '@mui/material';
import { Plus, Trash2, Edit2, Package, Sparkles } from 'lucide-react';
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
    setOpenModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setDescription(p.description);
    setIndustry(p.industry);
    setFeaturesText(p.features.join('\n'));
    setProblemSolved(p.problem_solved);
    setCustomerSummary(p.target_customer_summary);
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      fetchProducts();
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name,
        description,
        industry,
        features: features.length > 0 ? features : ['Core service feature'],
        problem_solved: problemSolved,
        target_customer_summary: customerSummary,
      };

      if (editProduct) {
        await api.updateProduct(editProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setOpenModal(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
            Technology Products & Services (FR1)
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Maintain product catalog, technical features, and solved problems for marketing strategy assessments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={handleOpenCreate}
        >
          Add Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Package size={48} color="#0d9488" style={{ marginBottom: 16 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Products Registered
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Register your software product or tech service to begin generating customer-oriented marketing strategies.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenCreate}>
            Register First Product
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {products.map((prod) => (
            <Grid size={{ xs: 12, md: 6 }} key={prod.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                      {prod.name}
                    </Typography>
                    <Chip label={prod.industry} size="small" color="primary" variant="outlined" />
                  </Box>

                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.6 }}>
                    {prod.description}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
                    MAIN FEATURES:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                    {prod.features.map((feat, idx) => (
                      <Chip
                        key={idx}
                        label={feat}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600, display: 'block' }}>
                      PROBLEM SOLVED:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                      {prod.problem_solved}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 2.5, pt: 0, justifyContent: 'space-between' }}>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenEdit(prod)} sx={{ color: '#94a3b8' }}>
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(prod.id)} sx={{ color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<Sparkles size={16} />}
                    onClick={() => navigate(`/wizard?product_id=${prod.id}`)}
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editProduct ? 'Edit Technology Product' : 'Register New Technology Product'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Product or Service Name (Q1)"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            helperText="Explain what your product does, main features, and the technologies used."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Technical Features (Q3: One feature per line)"
            fullWidth
            multiline
            rows={3}
            required
            helperText="Enter repeatable technical capabilities (e.g., Barcode stock logging, Cloud sync, Biometric authentication)."
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
          />
          <TextField
            label="Main Problem Solved"
            fullWidth
            required
            helperText="What operational customer bottleneck or pain point does this product eliminate?"
            value={problemSolved}
            onChange={(e) => setProblemSolved(e.target.value)}
          />
          <TextField
            label="Target Customer Summary"
            fullWidth
            required
            helperText="Briefly describe the primary target buyers (e.g. Retail shop owners and SME accountants)."
            value={customerSummary}
            onChange={(e) => setCustomerSummary(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
