const Resource = require('../models/Resource');

exports.createResource = async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource', error: error.message });
  }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).lean();
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource', error: error.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error: error.message });
  }
};

exports.predictDemandAndAllocate = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Logic to predict demand based on current occupancy
    const bedOccupancyRate = resource.beds.occupied / (resource.beds.total || 1);
    const icuOccupancyRate = resource.icuCapacity.occupied / (resource.icuCapacity.total || 1);

    let recommendedAction = 'Maintain current capacity.';
    let expectedBedsNeeded = 0;
    let expectedIcuNeeded = 0;

    if (bedOccupancyRate > 0.8) {
      expectedBedsNeeded = Math.ceil(resource.beds.total * 0.1); // Predict 10% more needed
      recommendedAction = `High bed occupancy (${(bedOccupancyRate*100).toFixed(1)}%). Consider allocating more general beds or accelerating discharges. `;
    }

    if (icuOccupancyRate > 0.7) {
      expectedIcuNeeded = Math.ceil(resource.icuCapacity.total * 0.15); // Predict 15% more needed
      recommendedAction += `High ICU occupancy (${(icuOccupancyRate*100).toFixed(1)}%). Prepare overflow ICU beds and ensure staff availability.`;
    }

    resource.demandPrediction = {
      expectedBedsNeeded,
      expectedIcuNeeded,
      recommendedAction: recommendedAction.trim()
    };

    await resource.save();

    res.json({
      message: 'Demand prediction completed',
      prediction: resource.demandPrediction,
      currentStatus: {
        bedOccupancyRate,
        icuOccupancyRate
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error predicting demand', error: error.message });
  }
};
