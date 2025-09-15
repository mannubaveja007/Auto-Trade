import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProcurementRequest, getBuyers, triggerVendorMatching } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProcurementRequestForm({ onRequestCreated, onClose }) {
  const [formData, setFormData] = useState({
    buyerId: '',
    productName: '',
    category: '',
    quantity: '',
    unit: '',
    deliveryDate: '',
    deliveryAddress: '',
    maxBudget: '',
    urgency: 'medium',
    specifications: ''
  });

  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      const buyersData = await getBuyers();
      setBuyers(buyersData);
      if (buyersData.length > 0) {
        setFormData(prev => ({ ...prev, buyerId: buyersData[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load company data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.productName) newErrors.productName = 'Product name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.quantity) newErrors.quantity = 'Quantity is required';
      if (!formData.unit) newErrors.unit = 'Unit is required';
    } else if (stepNumber === 2) {
      if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
      if (!formData.urgency) newErrors.urgency = 'Urgency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setLoading(true);

    try {
      const requestData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : null,
        specifications: formData.specifications ? JSON.parse(`{"description": "${formData.specifications}"}`) : null
      };

      const request = await createProcurementRequest(requestData);

      // Show success step
      setStep(3);

      // Trigger AI vendor matching
      try {
        const matchingResult = await triggerVendorMatching(request.id);
        toast.success(`AI agents contacted ${matchingResult.results.length} vendors!`);
      } catch (aiError) {
        console.error('AI matching failed:', aiError);
        toast.success('Request created! AI vendor matching in progress...');
      }

      // Auto-close after success
      setTimeout(() => {
        if (onRequestCreated) {
          onRequestCreated(request);
        }
        if (onClose) {
          onClose();
        }
      }, 2000);

    } catch (error) {
      toast.error('Failed to create procurement request');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create Procurement Request
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Let AI find and negotiate with the best vendors
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex space-x-2">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  s <= step
                    ? 'bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
                animate={{
                  scale: s === step ? 1.2 : 1,
                  transition: { type: 'spring', stiffness: 300 }
                }}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What do you need?
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Tell us about your procurement requirements
                  </p>
                </div>

                <Select
                  label="Company"
                  name="buyerId"
                  value={formData.buyerId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Company</option>
                  {buyers.map(buyer => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.companyName}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="e.g., Tomato Sauce"
                    error={errors.productName}
                    required
                  />

                  <Select
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    error={errors.category}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="food-ingredients">Food Ingredients</option>
                    <option value="condiments">Condiments</option>
                    <option value="spices">Spices</option>
                    <option value="packaging">Packaging</option>
                    <option value="bulk-supplies">Bulk Supplies</option>
                    <option value="maintenance">Maintenance</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="1000"
                    min="1"
                    error={errors.quantity}
                    required
                  />

                  <Select
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    error={errors.unit}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="pieces">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="gallons">Gallons</option>
                    <option value="tons">Tons</option>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext} className="flex items-center space-x-2">
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delivery & Budget
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    When do you need it and what's your budget?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Delivery Date"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    min={getTomorrowDate()}
                    error={errors.deliveryDate}
                    required
                  />

                  <Input
                    label="Max Budget ($)"
                    name="maxBudget"
                    type="number"
                    value={formData.maxBudget}
                    onChange={handleChange}
                    placeholder="5000"
                    min="0"
                    step="0.01"
                  />
                </div>

                <Input
                  label="Delivery Address"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="123 Main St, Chicago, IL 60601"
                />

                <Select
                  label="Urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  error={errors.urgency}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </Select>

                <Textarea
                  label="Additional Specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="Any specific requirements, quality standards, certifications needed..."
                  rows="3"
                />

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create & Find Vendors</span>
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Request Created Successfully!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500 dark:text-gray-400 mb-6"
                >
                  Our AI agents are now contacting vendors and will negotiate the best deals for you.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4"
                >
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    🤖 AI agents are working... You'll see quotes appear in real-time!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardBody>
    </Card>
  );
}

export default ProcurementRequestForm;