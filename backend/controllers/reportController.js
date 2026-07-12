const reportService = require('../services/reportService');
const { AppError } = require('../utils/errorHandler');

exports.getROIReport = async (req, res, next) => {
    try {
        const [data, metrics] = await Promise.all([
            reportService.getVehicleROI(),
            reportService.getOverallMetrics()
        ]);
        res.status(200).json({
            success: true,
            data,
            metrics
        });
    } catch (error) {
        next(new AppError('Failed to generate ROI report', 500));
    }
};

exports.downloadROICSV = async (req, res, next) => {
    try {
        const data = await reportService.getVehicleROI();
        const csv = reportService.generateCSV(data);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('vehicle-roi-report.csv');
        return res.send(csv);
    } catch (error) {
        next(new AppError('Failed to generate CSV download', 500));
    }
};
