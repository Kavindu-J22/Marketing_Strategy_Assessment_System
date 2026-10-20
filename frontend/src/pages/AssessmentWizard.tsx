import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Chip,
  Alert,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Product, FullQuestionnaireSubmission } from '../types';

const STEPS = [
  'Product Info (Q1–4)',
  'Target Customer (Q5–9)',
  'Technical Literacy (Q10–12)',
  'Value & Channels (Q13–17)',
  'Budget & Goals (Q18–21)',
  'Review & Execute',
];

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

const ROLES = [
  'Business owner',
  'IT professional',
  'Student',
  'Manager',
  'Accountant',
  'General consumer',
  'Operations staff',
  'Educator',
  'Healthcare administrator',
  'Marketing executive',
];

const LOCATIONS = [
  'All Sri Lanka',
  'Western Province',
  'Southern Province',
  'Central Province',
  'North Western Province',
  'Northern Province',
  'Eastern Province',
  'North Central Province',
  'Sabaragamuwa Province',
  'Uva Province',
  'Colombo',
  'Gampaha',
  'Kandy',
  'Galle',
  'Kurunegala',
  'Jaffna',
];

const PAIN_POINTS = [
  'Too much manual work',
  'High operating costs',
  'Low process efficiency',
  'Frequent data entry errors',
  'Limited information security',
  'Complicated daily workflows',
  'Difficulty tracking customers',
  'Slow access to records',
  'Missed appointments or orders',
  'Inconsistent reporting',
];

const CHANNELS = [
  'Facebook',
  'Instagram',
  'LinkedIn',
  'TikTok',
  'YouTube',
  'Google Ads',
  'Email Marketing',
  'Website/SEO',
  'None currently',
];

const CONTENT_TYPES = [
  'Short videos',
  'Educational videos',
  'Images/graphics',
  'Articles/blogs',
  'Case studies',
  'Product demonstrations',
  'Customer testimonials',
];

const GOALS = [
  'More website visitors',
  'More leads',
  'More sales',
  'More social media engagement',
  'More brand awareness',
];

export const AssessmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProductId = searchParams.get('product_id') || '';

  const [activeStep, setActiveStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);

  // Form State
  // Step 1: Product
  const [q1Name, setQ1Name] = useState('');
  const [q2Desc, setQ2Desc] = useState('');
  const [q3Features, setQ3Features] = useState<string[]>(['Real-time inventory logging', 'Cloud sync']);
  const [featureInput, setFeatureInput] = useState('');
  const [q4Industry, setQ4Industry] = useState('Software / SaaS');

  // Step 2: Customer
  const [q5Audience, setQ5Audience] = useState('Retail shop owners, wholesale distributors, and supermarket managers in urban areas.');
  const [q6MarketType, setQ6MarketType] = useState<'B2B' | 'B2C' | 'Both'>('B2B');
  const [q7AgeGroup, setQ7AgeGroup] = useState('25-34');
  const [q8Roles, setQ8Roles] = useState<string[]>(['Business owner', 'Manager']);
  const [q9Location, setQ9Location] = useState('Western Province');
  const [q9City, setQ9City] = useState('Colombo');

  // Step 3: Technical Literacy
  const [q10Score, setQ10Score] = useState(3);
  const [q11Score, setQ11Score] = useState(3);
  const [q12Score, setQ12Score] = useState(3);
  const [livePrediction, setLivePrediction] = useState<any>(null);
  const [predicting, setPredicting] = useState(false);

  // Step 4: Value & Channels
  const [q13Benefit, setQ13Benefit] = useState('Eliminates preventable stockouts and saves 10+ hours per week in manual stock reconciliation.');
  const [q14Pains, setQ14Pains] = useState<string[]>(['Too much manual work', 'Frequent data entry errors']);
  const [q15Channels, setQ15Channels] = useState<string[]>(['Facebook', 'LinkedIn', 'Website/SEO']);
  const [q16BestChannels, setQ16BestChannels] = useState<string[]>(['LinkedIn']);
  const [q17Content, setQ17Content] = useState<string[]>(['Product demonstrations', 'Case studies']);

  // Step 5: Budget & Goals
  const [q18Budget, setQ18Budget] = useState<number>(75000);
  const [q19Flex, setQ19Flex] = useState('Moderately flexible');
  const [q20Duration, setQ20Duration] = useState('3 months');
  const [q20Months, setQ20Months] = useState<number>(3);
  const [q21Goals, setQ21Goals] = useState<string[]>(['More leads']);
  const [kpiTarget, setKpiTarget] = useState<number>(50);
  const [kpiUnit, setKpiUnit] = useState('leads/month');

  // Submit / Processing state
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Pre-fill from selected product if exists
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await api.getProducts();
        setProducts(prods || []);
        if (selectedProductId && prods) {
          const match = prods.find((p) => p.id === selectedProductId);
          if (match) {
            setQ1Name(match.name);
            setQ2Desc(match.description);
            setQ4Industry(match.industry);
            setQ3Features(match.features);
            setQ13Benefit(match.problem_solved);
            setQ5Audience(match.target_customer_summary || q5Audience);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, [selectedProductId]);

  // Real-time ML Preview trigger on Step 3
  useEffect(() => {
    if (activeStep === 2) {
      const runPreview = async () => {
        setPredicting(true);
        try {
          const res = await api.predictAudience({
            industry: q4Industry,
            market_type: q6MarketType,
            customer_role: q8Roles[0] || 'Business owner',
            age_group: q7AgeGroup,
            location: q9Location,
            customer_audience_text: q5Audience,
            technology_comfort_1to5: q10Score,
            technical_terms_familiarity_1to5: q11Score,
            model_preference: 'auto',
          });
          setLivePrediction(res);
        } catch (e) {
          console.error('ML preview error:', e);
        } finally {
          setPredicting(false);
        }
      };
      runPreview();
    }
  }, [activeStep, q10Score, q11Score, q4Industry, q6MarketType, q5Audience]);

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setQ3Features([...q3Features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setQ3Features(q3Features.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    setValidationError('');
    // Step validation checks
    if (activeStep === 0) {
      if (!q1Name.trim()) return setValidationError('Product Name (Q1) is required.');
      if (!q2Desc.trim()) return setValidationError('Product Description (Q2) is required.');
      if (q3Features.length === 0) return setValidationError('Please add at least one feature (Q3).');
    } else if (activeStep === 1) {
      if (!q5Audience.trim()) return setValidationError('Target Customer description (Q5) is required.');
      if (q8Roles.length === 0) return setValidationError('Select at least one customer role (Q8).');
    } else if (activeStep === 3) {
      if (!q13Benefit.trim()) return setValidationError('Primary benefit statement (Q13) is required.');
      if (q14Pains.length === 0) return setValidationError('Select at least one customer pain point (Q14).');
      if (q15Channels.length === 0) return setValidationError('Select current channels or "None currently" (Q15).');
      if (q17Content.length === 0) return setValidationError('Select preferred content formats (Q17).');
    } else if (activeStep === 4) {
      if (q18Budget < 0) return setValidationError('Monthly budget (Q18) cannot be negative.');
      if (q21Goals.length === 0) return setValidationError('Select at least one success goal (Q21).');
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmitAnalysis = async () => {
    setSubmitting(true);
    setValidationError('');

    const textScaleQ10 = [
      '',
      'Very low - They are generally uncomfortable with technology.',
      'Low - They can use basic technology but may struggle with technical terms.',
      'Medium - They are comfortable with common digital tools and applications.',
      'High - They are familiar with advanced digital tools and technical concepts.',
      'Very high - They are highly technical professionals.',
    ][q10Score];

    const textScaleQ11 = [
      '',
      'Not familiar at all',
      'Slightly familiar',
      'Moderately familiar',
      'Very familiar',
      'Highly familiar',
    ][q11Score];

    const textScaleQ12 = [
      '',
      'Very simple, non-technical language',
      'Mostly simple language',
      'Balanced technical and simple language',
      'Detailed and technical language',
      'Highly technical and professional language',
    ][q12Score];

    const submission: FullQuestionnaireSubmission = {
      step1: {
        q1_product_name: q1Name,
        q2_product_description: q2Desc,
        q3_main_features: q3Features,
        q4_industry: q4Industry,
      },
      step2: {
        q5_primary_target_customer: q5Audience,
        q6_market_type: q6MarketType,
        q7_target_age_group: q7AgeGroup,
        q8_customer_occupation: q8Roles,
        q9_target_location: q9Location,
        q9_specific_city: q9City,
      },
      step3: {
        q10_technology_comfort: textScaleQ10,
        q10_score: q10Score,
        q11_technical_terms_familiarity: textScaleQ11,
        q11_score: q11Score,
        q12_message_detail_preference: textScaleQ12,
        q12_score: q12Score,
      },
      step4: {
        q13_main_customer_benefit: q13Benefit,
        q14_actual_customer_pain_points: q14Pains,
        q15_current_marketing_channels: q15Channels,
        q16_prior_best_channels: q16BestChannels,
        q17_preferred_content: q17Content,
      },
      step5: {
        q18_monthly_marketing_budget_LKR: q18Budget,
        q19_budget_flexibility: q19Flex,
        q20_campaign_duration: q20Duration,
        q20_explicit_months: q20Months,
        q21_success_definition: q21Goals,
        optional_kpi_target: kpiTarget,
        optional_kpi_unit: kpiUnit,
      },
      product_id: selectedProductId || 'prod-001',
    };

    try {
      const report = await api.runAnalysis(submission, 'synthetic_demo');
      const runId = report?.run_id || report?.id || `run-${Date.now()}`;
      navigate(`/campaigns/${runId}`);
    } catch (err: any) {
      console.error('Failed to run analysis:', err);
      setValidationError(err.response?.data?.detail || 'Failed to execute analysis. Please check the backend is running (uvicorn on port 8000).');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 3 }}>
      {/* Stepper Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 1 }}>
          Marketing Strategy Assessment Wizard
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
          Preserves Questionary Final.docx semantics (Q1–Q21) with research-grade AI & decision support.
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {validationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {validationError}
        </Alert>
      )}

      {/* STEP 1: PRODUCT INFO */}
      {activeStep === 0 && (
        <Card sx={{ p: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#14b8a6', mb: 0.5 }}>
                Page 1 — Product & Service Information (FR1)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Define your technology solution, technical features, and industrial category.
              </Typography>
            </Box>

            {products.length > 0 && (
              <TextField
                select
                label="Preload from Registered Product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                helperText="Select a registered product to populate fields automatically."
                fullWidth
              >
                <MenuItem value="">-- Create custom scenario --</MenuItem>
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.industry})
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="1. Product or Service Name (Q1)"
              fullWidth
              required
              value={q1Name}
              onChange={(e) => setQ1Name(e.target.value)}
              placeholder="e.g. Nivora StockSync Cloud"
            />

            <TextField
              select
              label="4. What industry does your product belong to? (Q4)"
              fullWidth
              required
              value={q4Industry}
              onChange={(e) => setQ4Industry(e.target.value)}
            >
              {INDUSTRIES.map((ind) => (
                <MenuItem key={ind} value={ind}>
                  {ind}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="2. Briefly describe your product or service (Q2)"
              fullWidth
              multiline
              rows={3}
              required
              helperText="Explain what your product does, its main capabilities, and the technologies used."
              value={q2Desc}
              onChange={(e) => setQ2Desc(e.target.value)}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                3. Main Features of Your Product (Q3)
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
                Enter repeatable, concrete technical capabilities (e.g. Real-time barcode inventory, Multi-branch sync).
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Type a feature and press Add..."
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <Button variant="outlined" color="primary" onClick={handleAddFeature}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {q3Features.map((feat, idx) => (
                  <Chip
                    key={idx}
                    label={feat}
                    onDelete={() => handleRemoveFeature(idx)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: TARGET CUSTOMER */}
      {activeStep === 1 && (
        <Card sx={{ p: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#14b8a6', mb: 0.5 }}>
                Page 2 — Target Customer Information (FR2)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Profile your target buyers and geographic deployment in Sri Lanka.
              </Typography>
            </Box>

            <TextField
              label="5. Who is your primary target customer? (Q5)"
              fullWidth
              multiline
              rows={3}
              required
              helperText="Provide an explicit text description of the target audience profile and their daily workflow."
              value={q5Audience}
              onChange={(e) => setQ5Audience(e.target.value)}
            />

            <FormControl component="fieldset">
              <FormLabel sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.5 }}>
                6. Is your target market B2B, B2C, or both? (Q6)
              </FormLabel>
              <RadioGroup
                row
                value={q6MarketType}
                onChange={(e) => setQ6MarketType(e.target.value as any)}
              >
                <FormControlLabel value="B2B" control={<Radio color="primary" />} label="B2B" />
                <FormControlLabel value="B2C" control={<Radio color="primary" />} label="B2C" />
                <FormControlLabel value="Both" control={<Radio color="primary" />} label="Both" />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="7. Target Age Group (Q7)"
                  fullWidth
                  value={q7AgeGroup}
                  onChange={(e) => setQ7AgeGroup(e.target.value)}
                >
                  {['18-24', '25-34', '35-44', '45-54', '55+', 'Multiple age groups'].map((age) => (
                    <MenuItem key={age} value={age}>
                      {age}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="9. Target Location in Sri Lanka (Q9)"
                  fullWidth
                  value={q9Location}
                  onChange={(e) => setQ9Location(e.target.value)}
                >
                  {LOCATIONS.map((loc) => (
                    <MenuItem key={loc} value={loc}>
                      {loc}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                8. Typical Occupation or Role of Target Customer (Q8)
              </Typography>
              <FormGroup row>
                {ROLES.map((role) => (
                  <FormControlLabel
                    key={role}
                    control={
                      <Checkbox
                        color="primary"
                        checked={q8Roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) setQ8Roles([...q8Roles, role]);
                          else setQ8Roles(q8Roles.filter((r) => r !== role));
                        }}
                      />
                    }
                    label={role}
                  />
                ))}
              </FormGroup>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: TECHNICAL LITERACY */}
      {activeStep === 2 && (
        <Card sx={{ p: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#14b8a6', mb: 0.5 }}>
                Page 3 — Technical Literacy & Preference (FR3)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                5-point scale questions preserving exact Questionary Final.docx options.
              </Typography>
            </Box>

            {/* Q10 */}
            <FormControl component="fieldset">
              <FormLabel sx={{ color: '#f1f5f9', fontWeight: 600, mb: 1 }}>
                10. How would you describe your target customer's comfort with technology?
              </FormLabel>
              <RadioGroup
                value={q10Score}
                onChange={(e) => setQ10Score(Number(e.target.value))}
              >
                <FormControlLabel value={1} control={<Radio color="primary" />} label="1: Very low — Uncomfortable with technology" />
                <FormControlLabel value={2} control={<Radio color="primary" />} label="2: Low — Uses basic tech but struggles with technical terms" />
                <FormControlLabel value={3} control={<Radio color="primary" />} label="3: Medium — Comfortable with common digital applications" />
                <FormControlLabel value={4} control={<Radio color="primary" />} label="4: High — Familiar with advanced digital tools and concepts" />
                <FormControlLabel value={5} control={<Radio color="primary" />} label="5: Very high — Highly technical software professionals" />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            {/* Q11 */}
            <FormControl component="fieldset">
              <FormLabel sx={{ color: '#f1f5f9', fontWeight: 600, mb: 1 }}>
                11. How familiar is your target customer with technical terms related to your product?
              </FormLabel>
              <RadioGroup
                value={q11Score}
                onChange={(e) => setQ11Score(Number(e.target.value))}
              >
                <FormControlLabel value={1} control={<Radio color="primary" />} label="1: Not familiar at all" />
                <FormControlLabel value={2} control={<Radio color="primary" />} label="2: Slightly familiar" />
                <FormControlLabel value={3} control={<Radio color="primary" />} label="3: Moderately familiar" />
                <FormControlLabel value={4} control={<Radio color="primary" />} label="4: Very familiar" />
                <FormControlLabel value={5} control={<Radio color="primary" />} label="5: Highly familiar" />
              </RadioGroup>
            </FormControl>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            {/* Q12 */}
            <FormControl component="fieldset">
              <FormLabel sx={{ color: '#f1f5f9', fontWeight: 600, mb: 1 }}>
                12. How detailed should your marketing communication be for your target audience? (Preference)
              </FormLabel>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                Note: Communication preference is captured as user guidance, NOT used as an input feature for predicting literacy.
              </Typography>
              <RadioGroup
                value={q12Score}
                onChange={(e) => setQ12Score(Number(e.target.value))}
              >
                <FormControlLabel value={1} control={<Radio color="primary" />} label="1: Very simple, non-technical language" />
                <FormControlLabel value={2} control={<Radio color="primary" />} label="2: Mostly simple language" />
                <FormControlLabel value={3} control={<Radio color="primary" />} label="3: Balanced technical and simple language" />
                <FormControlLabel value={4} control={<Radio color="primary" />} label="4: Detailed and technical language" />
                <FormControlLabel value={5} control={<Radio color="primary" />} label="5: Highly technical and professional language" />
              </RadioGroup>
            </FormControl>

            {/* Live ML Prediction Preview Card */}
            <Card sx={{ bgcolor: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Sparkles size={18} color="#14b8a6" />
                  <Typography variant="subtitle2" sx={{ color: '#14b8a6', fontWeight: 700 }}>
                    PyTorch Multimodal Classifier (Live Preview)
                  </Typography>
                  {predicting && <CircularProgress size={14} color="primary" />}
                </Box>
                {livePrediction ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#f1f5f9' }}>
                        Predicted Category: <strong>{livePrediction.predicted_class} Literacy</strong>
                      </Typography>
                      <Chip
                        label={`Confidence: ${(livePrediction.confidence_score * 100).toFixed(1)}%`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      Distribution — Low: {(livePrediction.probabilities?.Low * 100).toFixed(0)}% | Medium:{' '}
                      {(livePrediction.probabilities?.Medium * 100).toFixed(0)}% | High:{' '}
                      {(livePrediction.probabilities?.High * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Adjust scores above to see real-time multimodal model predictions.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: VALUE & CHANNELS */}
      {activeStep === 3 && (
        <Card sx={{ p: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#14b8a6', mb: 0.5 }}>
                Page 4 — Customer Benefits & Marketing Channels (FR4, FR5)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Separates customer pain points from benefits, with channel performance history.
              </Typography>
            </Box>

            <TextField
              label="13. What is the main benefit you want customers to understand about your product? (Q13)"
              fullWidth
              multiline
              rows={2}
              required
              value={q13Benefit}
              onChange={(e) => setQ13Benefit(e.target.value)}
              helperText="Focus on the primary positive transformation your customer experiences."
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                14. What are the main customer pain points your product solves? (Q14)
              </Typography>
              <FormGroup row>
                {PAIN_POINTS.map((pain) => (
                  <FormControlLabel
                    key={pain}
                    control={
                      <Checkbox
                        color="primary"
                        checked={q14Pains.includes(pain)}
                        onChange={(e) => {
                          if (e.target.checked) setQ14Pains([...q14Pains, pain]);
                          else setQ14Pains(q14Pains.filter((p) => p !== pain));
                        }}
                      />
                    }
                    label={pain}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                15. Which marketing channels are you currently using? (Q15)
              </Typography>
              <FormGroup row>
                {CHANNELS.map((ch) => (
                  <FormControlLabel
                    key={ch}
                    control={
                      <Checkbox
                        color="primary"
                        checked={q15Channels.includes(ch)}
                        onChange={(e) => {
                          if (ch === 'None currently') {
                            setQ15Channels(e.target.checked ? ['None currently'] : []);
                            setQ16BestChannels([]);
                          } else {
                            const filtered = q15Channels.filter((c) => c !== 'None currently');
                            if (e.target.checked) setQ15Channels([...filtered, ch]);
                            else setQ15Channels(filtered.filter((c) => c !== ch));
                          }
                        }}
                      />
                    }
                    label={ch}
                  />
                ))}
              </FormGroup>
            </Box>

            {/* Q16 Dynamic Filtered Channels */}
            {!q15Channels.includes('None currently') && q15Channels.length > 0 && (
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.15)', p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  16. Which marketing channels have worked best for you so far? (Q16)
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                  Dynamically filtered to only channels selected in Q15.
                </Typography>
                <FormGroup row>
                  {q15Channels.map((ch) => (
                    <FormControlLabel
                      key={ch}
                      control={
                        <Checkbox
                          color="primary"
                          checked={q16BestChannels.includes(ch)}
                          onChange={(e) => {
                            if (e.target.checked) setQ16BestChannels([...q16BestChannels, ch]);
                            else setQ16BestChannels(q16BestChannels.filter((c) => c !== ch));
                          }}
                        />
                      }
                      label={ch}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={q16BestChannels.includes('No performance data')}
                        onChange={(e) => {
                          if (e.target.checked) setQ16BestChannels(['No performance data']);
                          else setQ16BestChannels([]);
                        }}
                      />
                    }
                    label="No performance data yet"
                  />
                </FormGroup>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                17. What type of content does your target audience engage with most? (Q17)
              </Typography>
              <FormGroup row>
                {CONTENT_TYPES.map((content) => (
                  <FormControlLabel
                    key={content}
                    control={
                      <Checkbox
                        color="primary"
                        checked={q17Content.includes(content)}
                        onChange={(e) => {
                          if (e.target.checked) setQ17Content([...q17Content, content]);
                          else setQ17Content(q17Content.filter((c) => c !== content));
                        }}
                      />
                    }
                    label={content}
                  />
                ))}
              </FormGroup>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: BUDGET & GOALS */}
      {activeStep === 4 && (
        <Card sx={{ p: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#14b8a6', mb: 0.5 }}>
                Page 5 — Budget Allocation & Success Goals (FR6)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Monetary amounts in Sri Lankan Rupees (LKR) with integer arithmetic and constraint validation.
              </Typography>
            </Box>

            <TextField
              label="18. Monthly Marketing Budget in Sri Lankan Rupees (LKR) (Q18)"
              type="number"
              fullWidth
              required
              value={q18Budget}
              onChange={(e) => setQ18Budget(Math.max(0, parseInt(e.target.value) || 0))}
              helperText="Zero budget (LKR 0) is supported for organic bootstrap strategies."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="19. How flexible is your marketing budget? (Q19)"
                  fullWidth
                  value={q19Flex}
                  onChange={(e) => setQ19Flex(e.target.value)}
                >
                  {['Fixed budget', 'Slightly flexible', 'Moderately flexible', 'Highly flexible'].map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="20. Expected Campaign Duration (Q20)"
                  fullWidth
                  value={q20Duration}
                  onChange={(e) => {
                    setQ20Duration(e.target.value);
                    if (e.target.value === '1 month') setQ20Months(1);
                    else if (e.target.value === '3 months') setQ20Months(3);
                    else if (e.target.value === '6 months') setQ20Months(6);
                    else setQ20Months(12);
                  }}
                >
                  {['1 month', '3 months', '6 months', 'More than 6 months'].map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {q20Duration === 'More than 6 months' && (
              <TextField
                label="Explicit Number of Months"
                type="number"
                fullWidth
                value={q20Months}
                onChange={(e) => setQ20Months(Math.max(7, parseInt(e.target.value) || 7))}
                helperText="Specify the planned campaign duration in months."
              />
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                21. What would define a successful campaign for your business? (Q21)
              </Typography>
              <FormGroup row>
                {GOALS.map((goal) => (
                  <FormControlLabel
                    key={goal}
                    control={
                      <Checkbox
                        color="primary"
                        checked={q21Goals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) setQ21Goals([...q21Goals, goal]);
                          else setQ21Goals(q21Goals.filter((g) => g !== goal));
                        }}
                      />
                    }
                    label={goal}
                  />
                ))}
              </FormGroup>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Optional Monthly KPI Target Count"
                  type="number"
                  fullWidth
                  value={kpiTarget}
                  onChange={(e) => setKpiTarget(Math.max(0, parseInt(e.target.value) || 0))}
                  helperText="e.g. 50 leads or 5,000 visitors per month"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="KPI Target Unit"
                  fullWidth
                  value={kpiUnit}
                  onChange={(e) => setKpiUnit(e.target.value)}
                  placeholder="e.g. leads/month, visits/month"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* STEP 6: REVIEW & EXECUTE */}
      {activeStep === 5 && (
        <Card sx={{ p: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 1 }}>
                Assessment Review & Pipeline Execution
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Please review your campaign inputs. Upon confirmation, the backend orchestrates the PyTorch classifier, Gemini messaging, AHP channel ranking, and budget optimization.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#14b8a6', fontWeight: 600 }}>
                    Product & Audience Summary
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Product:</strong> {q1Name} ({q4Industry})
                  </Typography>
                  <Typography variant="body2">
                    <strong>Market:</strong> {q6MarketType} | Location: {q9Location}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Comfort / Terms:</strong> {q10Score}/5 comfort, {q11Score}/5 terms
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#38bdf8', fontWeight: 600 }}>
                    Budget & Goals
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Monthly Budget:</strong> LKR {q18Budget.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Planned ({q20Months} mo):</strong> LKR {(q18Budget * q20Months).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Primary Objective:</strong> {q21Goals.join(', ')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Alert severity="warning" icon={<AlertTriangle size={20} />}>
              <strong>Notice:</strong> Strategy recommendations are generated from synthetic research priors and multi-criteria AHP algorithms. Predictions are marked "Not yet empirically validated".
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0 || submitting}
          startIcon={<ArrowLeft size={16} />}
          onClick={handleBack}
        >
          Previous
        </Button>

        {activeStep < 5 ? (
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowRight size={16} />}
            onClick={handleNext}
          >
            Next Step
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
            onClick={handleSubmitAnalysis}
            sx={{ px: 4, py: 1.25 }}
          >
            {submitting ? 'Orchestrating Assessment...' : 'Run Strategy Assessment'}
          </Button>
        )}
      </Box>
    </Box>
  );
};
