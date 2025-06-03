import { mean, median, std } from 'mathjs';
import _ from 'lodash';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

// Process raw workout data into structured format
export const processWorkoutData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];
  
  return rawData
    .filter(row => row.Date && row['Exercise Name'])
    .map(row => ({
      ...row,
      date: parseISO(row.Date),
      volume: (row.Weight || 0) * (row.Reps || 0),
      intensity: calculateIntensity(row.Weight, row.Reps, row.RPE),
      muscleGroup: getMuscleGroup(row['Exercise Name']),
      exerciseType: getExerciseType(row['Exercise Name']),
      workoutDuration: parseDuration(row.Duration),
      oneRM: calculate1RM(row.Weight, row.Reps)
    }))
    .sort((a, b) => a.date - b.date);
};

// Calculate advanced metrics and analytics
export const calculateAdvancedMetrics = (processedData, userProfile = {}) => {
  if (!processedData || processedData.length === 0) {
    return null;
  }

  const analytics = {
    // Basic metrics
    totalWorkouts: calculateTotalWorkouts(processedData),
    totalVolume: calculateTotalVolume(processedData),
    totalReps: calculateTotalReps(processedData),
    avgWorkoutDuration: calculateAvgDuration(processedData),
    
    // Time series data
    volumeOverTime: calculateVolumeOverTime(processedData),
    strengthOverTime: calculateStrengthOverTime(processedData),
    consistencyData: calculateConsistencyData(processedData),
    
    // Exercise analytics
    exerciseStats: calculateExerciseStats(processedData),
    muscleGroupAnalysis: calculateMuscleGroupAnalysis(processedData),
    exerciseVariety: calculateExerciseVariety(processedData),
    
    // Performance metrics
    strengthGains: calculateStrengthGains(processedData),
    volumeGains: calculateVolumeGains(processedData),
    progressionRates: calculateProgressionRates(processedData),
    personalRecords: calculatePersonalRecords(processedData),
    
    // Advanced analytics
    workoutFrequency: calculateWorkoutFrequency(processedData),
    recoveryPatterns: calculateRecoveryPatterns(processedData),
    plateauDetection: detectPlateaus(processedData),
    balanceAnalysis: calculateMuscleBalance(processedData),
    
    // Prediction inputs
    trendAnalysis: calculateTrendAnalysis(processedData),
    seasonality: calculateSeasonality(processedData),
    performanceFactors: calculatePerformanceFactors(processedData),
    
    // Efficiency metrics
    volumeEfficiency: calculateVolumeEfficiency(processedData),
    timeEfficiency: calculateTimeEfficiency(processedData),
    intensityDistribution: calculateIntensityDistribution(processedData),
    
    // Risk assessment
    injuryRiskFactors: calculateInjuryRisk(processedData),
    overtrainingMarkers: detectOvertraining(processedData),
    formRegression: detectFormRegression(processedData)
  };

  return analytics;
};

// Generate AI predictions
export const generatePredictions = (processedData, analytics, userProfile = {}) => {
  if (!analytics) return null;

  const predictions = {
    strengthProjections: generateStrengthProjections(processedData, analytics, userProfile),
    volumeProjections: generateVolumeProjections(processedData, analytics),
    bodyCompositionEstimates: estimateBodyComposition(processedData, analytics, userProfile),
    injuryPrevention: generateInjuryPrevention(analytics),
    optimalTraining: generateOptimalTraining(analytics, userProfile),
    plateauPrevention: generatePlateauPrevention(analytics),
    periodizationPlan: generatePeriodizationPlan(analytics, userProfile),
    recoveryOptimization: generateRecoveryOptimization(analytics)
  };

  return predictions;
};

// Helper functions for calculations

const calculateTotalWorkouts = (data) => {
  return new Set(data.map(row => row.Date)).size;
};

const calculateTotalVolume = (data) => {
  return data.reduce((sum, row) => sum + (row.volume || 0), 0);
};

const calculateTotalReps = (data) => {
  return data.reduce((sum, row) => sum + (row.Reps || 0), 0);
};

const calculateAvgDuration = (data) => {
  const durations = data
    .map(row => row.workoutDuration)
    .filter(d => d && d > 0);
  
  return durations.length ? mean(durations) : 0;
};

const calculateVolumeOverTime = (data) => {
  const volumeByDate = _.groupBy(data, row => format(row.date, 'yyyy-MM-dd'));
  
  return Object.entries(volumeByDate).map(([date, rows]) => ({
    date,
    volume: rows.reduce((sum, row) => sum + row.volume, 0),
    workouts: new Set(rows.map(r => r['Workout Name'])).size
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const calculateStrengthOverTime = (data) => {
  const exerciseGroups = _.groupBy(data, 'Exercise Name');
  
  return Object.entries(exerciseGroups).map(([exercise, rows]) => {
    const sortedRows = rows.sort((a, b) => a.date - b.date);
    const strengthProgression = sortedRows.map((row, index) => ({
      date: format(row.date, 'yyyy-MM-dd'),
      weight: row.Weight || 0,
      oneRM: row.oneRM,
      volume: row.volume,
      sessionIndex: index
    }));
    
    return {
      exercise,
      progression: strengthProgression,
      totalGain: (sortedRows[sortedRows.length - 1]?.Weight || 0) - (sortedRows[0]?.Weight || 0),
      progressionRate: calculateExerciseProgressionRate(sortedRows)
    };
  });
};

const calculateConsistencyData = (data) => {
  const workoutDates = [...new Set(data.map(row => format(row.date, 'yyyy-MM-dd')))].sort();
  
  if (workoutDates.length < 2) return { streaks: [], avgGap: 0, consistency: 0 };
  
  const gaps = [];
  const streaks = [];
  let currentStreak = 1;
  
  for (let i = 1; i < workoutDates.length; i++) {
    const gap = differenceInDays(new Date(workoutDates[i]), new Date(workoutDates[i - 1]));
    gaps.push(gap);
    
    if (gap === 1) {
      currentStreak++;
    } else {
      if (currentStreak > 1) {
        streaks.push(currentStreak);
      }
      currentStreak = 1;
    }
  }
  
  if (currentStreak > 1) {
    streaks.push(currentStreak);
  }
  
  return {
    streaks,
    longestStreak: Math.max(...streaks, 0),
    avgGap: mean(gaps),
    consistency: Math.max(0, 100 - mean(gaps) * 10)
  };
};

const calculateExerciseStats = (data) => {
  const exerciseGroups = _.groupBy(data, 'Exercise Name');
  
  return Object.entries(exerciseGroups).reduce((stats, [exercise, rows]) => {
    const weights = rows.map(r => r.Weight || 0).filter(w => w > 0);
    const volumes = rows.map(r => r.volume || 0);
    const oneRMs = rows.map(r => r.oneRM || 0).filter(rm => rm > 0);
    
    stats[exercise] = {
      name: exercise,
      sessions: rows.length,
      totalVolume: volumes.reduce((sum, v) => sum + v, 0),
      avgVolume: mean(volumes),
      maxWeight: Math.max(...weights, 0),
      avgWeight: weights.length ? mean(weights) : 0,
      maxOneRM: Math.max(...oneRMs, 0),
      totalReps: rows.reduce((sum, r) => sum + (r.Reps || 0), 0),
      muscleGroup: rows[0]?.muscleGroup || 'unknown',
      exerciseType: rows[0]?.exerciseType || 'unknown',
      progressionRate: calculateExerciseProgressionRate(rows),
      volumeProgression: calculateVolumeProgression(rows),
      lastPerformed: Math.max(...rows.map(r => r.date.getTime())),
      frequency: calculateExerciseFrequency(rows)
    };
    
    return stats;
  }, {});
};

const calculateMuscleGroupAnalysis = (data) => {
  const muscleGroups = _.groupBy(data, 'muscleGroup');
  
  return Object.entries(muscleGroups).reduce((analysis, [group, rows]) => {
    const totalVolume = rows.reduce((sum, r) => sum + r.volume, 0);
    const exercises = new Set(rows.map(r => r['Exercise Name'])).size;
    const sessions = new Set(rows.map(r => r.Date)).size;
    
    analysis[group] = {
      name: group,
      totalVolume,
      exercises,
      sessions,
      avgVolumePerSession: totalVolume / sessions,
      proportion: 0, // Will be calculated after all groups are processed
      recovery: calculateMuscleGroupRecovery(rows),
      development: calculateMuscleGroupDevelopment(rows)
    };
    
    return analysis;
  }, {});
};

const calculateExerciseVariety = (data) => {
  const totalExercises = new Set(data.map(r => r['Exercise Name'])).size;
  const exercisesByMuscleGroup = _.groupBy(data, 'muscleGroup');
  
  const varietyByMuscleGroup = Object.entries(exercisesByMuscleGroup).reduce((variety, [group, rows]) => {
    variety[group] = new Set(rows.map(r => r['Exercise Name'])).size;
    return variety;
  }, {});
  
  return {
    totalExercises,
    varietyByMuscleGroup,
    varietyScore: calculateVarietyScore(data)
  };
};

const calculateStrengthGains = (data) => {
  const exerciseGroups = _.groupBy(data, 'Exercise Name');
  
  return Object.entries(exerciseGroups).reduce((gains, [exercise, rows]) => {
    const sortedRows = rows.sort((a, b) => a.date - b.date);
    const firstWeight = sortedRows[0]?.Weight || 0;
    const lastWeight = sortedRows[sortedRows.length - 1]?.Weight || 0;
    
    gains[exercise] = {
      absolute: lastWeight - firstWeight,
      percentage: firstWeight ? ((lastWeight - firstWeight) / firstWeight) * 100 : 0,
      timespan: differenceInDays(
        sortedRows[sortedRows.length - 1]?.date,
        sortedRows[0]?.date
      ),
      ratePerWeek: 0 // Will be calculated below
    };
    
    if (gains[exercise].timespan > 0) {
      gains[exercise].ratePerWeek = (gains[exercise].absolute / gains[exercise].timespan) * 7;
    }
    
    return gains;
  }, {});
};

const calculateVolumeGains = (data) => {
  const weeklyVolume = calculateWeeklyVolume(data);
  
  if (weeklyVolume.length < 2) return { trend: 'insufficient_data' };
  
  const firstWeek = weeklyVolume[0].volume;
  const lastWeek = weeklyVolume[weeklyVolume.length - 1].volume;
  const timespan = weeklyVolume.length;
  
  return {
    absolute: lastWeek - firstWeek,
    percentage: firstWeek ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0,
    weeklyTrend: calculateLinearTrend(weeklyVolume.map(w => w.volume)),
    volatility: std(weeklyVolume.map(w => w.volume))
  };
};

const calculateProgressionRates = (data) => {
  const exerciseGroups = _.groupBy(data, 'Exercise Name');
  
  return Object.entries(exerciseGroups).reduce((rates, [exercise, rows]) => {
    const weights = rows.map(r => ({ date: r.date, weight: r.Weight || 0 }))
      .filter(w => w.weight > 0)
      .sort((a, b) => a.date - b.date);
    
    if (weights.length < 2) {
      rates[exercise] = 0;
      return rates;
    }
    
    // Calculate linear regression for progression rate
    const slope = calculateLinearRegression(weights);
    rates[exercise] = slope * 7; // Convert to per-week rate
    
    return rates;
  }, {});
};

const calculatePersonalRecords = (data) => {
  const exerciseGroups = _.groupBy(data, 'Exercise Name');
  
  return Object.entries(exerciseGroups).reduce((prs, [exercise, rows]) => {
    const maxWeight = Math.max(...rows.map(r => r.Weight || 0));
    const maxVolume = Math.max(...rows.map(r => r.volume || 0));
    const maxOneRM = Math.max(...rows.map(r => r.oneRM || 0));
    
    const maxWeightRow = rows.find(r => r.Weight === maxWeight);
    const maxVolumeRow = rows.find(r => r.volume === maxVolume);
    const maxOneRMRow = rows.find(r => r.oneRM === maxOneRM);
    
    prs[exercise] = {
      maxWeight: {
        value: maxWeight,
        date: maxWeightRow?.date,
        reps: maxWeightRow?.Reps
      },
      maxVolume: {
        value: maxVolume,
        date: maxVolumeRow?.date,
        weight: maxVolumeRow?.Weight,
        reps: maxVolumeRow?.Reps
      },
      maxOneRM: {
        value: maxOneRM,
        date: maxOneRMRow?.date,
        weight: maxOneRMRow?.Weight,
        reps: maxOneRMRow?.Reps
      }
    };
    
    return prs;
  }, {});
};

// Advanced calculation helpers

const calculateWorkoutFrequency = (data) => {
  const workoutDates = [...new Set(data.map(row => format(row.date, 'yyyy-MM-dd')))];
  const weeks = Math.ceil(workoutDates.length / 7);
  
  return {
    workoutsPerWeek: workoutDates.length / weeks,
    totalWeeks: weeks,
    mostActiveDay: calculateMostActiveDay(data),
    timeDistribution: calculateTimeDistribution(data)
  };
};

const calculateRecoveryPatterns = (data) => {
  const muscleGroupSessions = _.groupBy(data, 'muscleGroup');
  
  return Object.entries(muscleGroupSessions).reduce((patterns, [group, rows]) => {
    const sessionDates = [...new Set(rows.map(r => format(r.date, 'yyyy-MM-dd')))].sort();
    const recoveryTimes = [];
    
    for (let i = 1; i < sessionDates.length; i++) {
      const gap = differenceInDays(new Date(sessionDates[i]), new Date(sessionDates[i - 1]));
      recoveryTimes.push(gap);
    }
    
    patterns[group] = {
      avgRecoveryTime: recoveryTimes.length ? mean(recoveryTimes) : 0,
      minRecoveryTime: Math.min(...recoveryTimes, Infinity),
      maxRecoveryTime: Math.max(...recoveryTimes, 0),
      optimalRecoveryTime: calculateOptimalRecovery(group)
    };
    
    return patterns;
  }, {});
};

const detectPlateaus = (data) => {
  const exerciseGroups = _.groupBy(data, 'Exercise Name');
  
  return Object.entries(exerciseGroups).reduce((plateaus, [exercise, rows]) => {
    const sortedRows = rows.sort((a, b) => a.date - b.date);
    const weights = sortedRows.map(r => r.Weight || 0);
    
    // Detect plateaus using moving averages and variance
    const plateauPeriods = findPlateauPeriods(weights, sortedRows.map(r => r.date));
    
    plateaus[exercise] = {
      currentPlateau: isCurrentlyPlateauing(weights),
      plateauPeriods,
      plateauRisk: calculatePlateauRisk(weights),
      recommendations: generatePlateauRecommendations(exercise, weights)
    };
    
    return plateaus;
  }, {});
};

const calculateMuscleBalance = (data) => {
  const muscleGroups = _.groupBy(data, 'muscleGroup');
  const totalVolume = calculateTotalVolume(data);
  
  const volumeDistribution = Object.entries(muscleGroups).reduce((dist, [group, rows]) => {
    const groupVolume = rows.reduce((sum, r) => sum + r.volume, 0);
    dist[group] = (groupVolume / totalVolume) * 100;
    return dist;
  }, {});
  
  return {
    volumeDistribution,
    imbalances: detectImbalances(volumeDistribution),
    recommendations: generateBalanceRecommendations(volumeDistribution)
  };
};

// Utility functions

export const getMuscleGroup = (exerciseName) => {
  const exercise = exerciseName.toLowerCase();
  
  const muscleMap = {
    chest: ['chest', 'bench', 'press', 'fly', 'dip'],
    back: ['lat', 'row', 'pulldown', 'pullup', 'pull-up'],
    shoulders: ['shoulder', 'lateral', 'rear', 'overhead', 'military'],
    arms: ['bicep', 'tricep', 'curl', 'extension'],
    legs: ['leg', 'squat', 'lunge', 'calf', 'quad', 'hamstring'],
    core: ['abs', 'plank', 'crunch', 'core']
  };
  
  for (const [group, keywords] of Object.entries(muscleMap)) {
    if (keywords.some(keyword => exercise.includes(keyword))) {
      return group;
    }
  }
  
  return 'other';
};

export const getExerciseType = (exerciseName) => {
  const exercise = exerciseName.toLowerCase();
  
  if (exercise.includes('machine')) return 'machine';
  if (exercise.includes('dumbbell') || exercise.includes('db')) return 'dumbbell';
  if (exercise.includes('barbell') || exercise.includes('bb')) return 'barbell';
  if (exercise.includes('cable')) return 'cable';
  if (exercise.includes('bodyweight') || exercise.includes('bw')) return 'bodyweight';
  
  return 'free_weight';
};

export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || reps < 1) return 0;
  if (reps === 1) return weight;
  
  // Epley formula
  return Math.round(weight * (1 + reps / 30));
};

export const calculateIntensity = (weight, reps, rpe) => {
  if (rpe && rpe > 0) {
    return (rpe / 10) * 100;
  }
  
  if (!weight || !reps) return 0;
  
  // Estimate intensity based on reps (assuming max effort)
  const intensityByReps = {
    1: 100, 2: 95, 3: 93, 4: 90, 5: 87,
    6: 85, 7: 83, 8: 80, 9: 77, 10: 75,
    11: 73, 12: 70, 13: 67, 14: 65, 15: 63
  };
  
  return intensityByReps[reps] || Math.max(50, 75 - (reps - 10) * 2);
};

const parseDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/(\d+)m/);
  return match ? parseInt(match[1]) : 0;
};

// Additional helper functions for advanced calculations...

const calculateLinearTrend = (values) => {
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + val * i, 0);
  const sumX2 = values.reduce((sum, val, i) => sum + i * i, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

const calculateLinearRegression = (points) => {
  const n = points.length;
  const xValues = points.map((p, i) => i);
  const yValues = points.map(p => p.weight);
  
  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

const calculateExerciseProgressionRate = (rows) => {
  if (rows.length < 2) return 0;
  const weights = rows.map(r => r.Weight || 0).filter(w => w > 0);
  if (weights.length < 2) return 0;
  
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const timespan = rows.length;
  
  return timespan > 0 ? ((lastWeight - firstWeight) / firstWeight) * 100 / timespan : 0;
};

const calculateVolumeProgression = (rows) => {
  if (rows.length < 2) return 0;
  const volumes = rows.map(r => (r.Weight || 0) * (r.Reps || 0));
  return calculateLinearTrend(volumes);
};

const calculateExerciseFrequency = (rows) => {
  const dates = new Set(rows.map(r => format(r.date, 'yyyy-MM-dd')));
  const weeks = Math.ceil(dates.size / 7);
  return weeks > 0 ? dates.size / weeks : 0;
};

const calculateMuscleGroupRecovery = (rows) => {
  const dates = [...new Set(rows.map(r => format(r.date, 'yyyy-MM-dd')))].sort();
  const gaps = [];
  
  for (let i = 1; i < dates.length; i++) {
    const gap = differenceInDays(new Date(dates[i]), new Date(dates[i - 1]));
    gaps.push(gap);
  }
  
  return gaps.length ? mean(gaps) : 0;
};

const calculateMuscleGroupDevelopment = (rows) => {
  const volumes = rows.map(r => (r.Weight || 0) * (r.Reps || 0));
  return {
    totalVolume: volumes.reduce((sum, v) => sum + v, 0),
    avgVolume: mean(volumes),
    trend: calculateLinearTrend(volumes)
  };
};

const calculateVarietyScore = (data) => {
  const exercisesByGroup = _.groupBy(data, 'muscleGroup');
  const groupVariety = Object.values(exercisesByGroup).map(
    group => new Set(group.map(r => r['Exercise Name'])).size
  );
  return mean(groupVariety);
};

const calculateWeeklyVolume = (data) => {
  const weeklyData = {};
  
  data.forEach(row => {
    const week = format(startOfWeek(row.date), 'yyyy-MM-dd');
    if (!weeklyData[week]) {
      weeklyData[week] = { week, volume: 0 };
    }
    weeklyData[week].volume += row.volume || 0;
  });
  
  return Object.values(weeklyData).sort((a, b) => new Date(a.week) - new Date(b.week));
};

const calculateMostActiveDay = (data) => {
  const dayCount = {};
  data.forEach(row => {
    const day = format(row.date, 'EEEE');
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  
  return Object.entries(dayCount).reduce((max, [day, count]) => 
    count > max.count ? { day, count } : max, { day: 'Monday', count: 0 }
  ).day;
};

const calculateTimeDistribution = (data) => {
  const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
  
  data.forEach(row => {
    const hour = row.date.getHours();
    if (hour < 12) timeSlots.morning++;
    else if (hour < 18) timeSlots.afternoon++;
    else timeSlots.evening++;
  });
  
  return timeSlots;
};

const calculateOptimalRecovery = (group) => {
  const recoveryTimes = {
    chest: 48,
    back: 72,
    shoulders: 48,
    arms: 48,
    legs: 72,
    core: 24
  };
  return recoveryTimes[group] || 48;
};

const findPlateauPeriods = (weights, dates) => {
  const plateauPeriods = [];
  let currentPlateau = null;
  
  for (let i = 1; i < weights.length; i++) {
    const weightChange = Math.abs(weights[i] - weights[i - 1]);
    
    if (weightChange < 2.5) { // Less than 2.5lb change
      if (!currentPlateau) {
        currentPlateau = { start: dates[i - 1], weights: [weights[i - 1]] };
      }
      currentPlateau.weights.push(weights[i]);
      currentPlateau.end = dates[i];
    } else {
      if (currentPlateau && currentPlateau.weights.length >= 3) {
        plateauPeriods.push(currentPlateau);
      }
      currentPlateau = null;
    }
  }
  
  return plateauPeriods;
};

const isCurrentlyPlateauing = (weights) => {
  if (weights.length < 4) return false;
  const recent = weights.slice(-4);
  const maxChange = Math.max(...recent) - Math.min(...recent);
  return maxChange < 5; // Less than 5lb variation in last 4 sessions
};

const calculatePlateauRisk = (weights) => {
  if (weights.length < 3) return 0;
  const recent = weights.slice(-3);
  const trend = calculateLinearTrend(recent);
  return Math.max(0, 100 - Math.abs(trend) * 20); // Higher risk if trend is flat
};

const generatePlateauRecommendations = (exercise, weights) => {
  const risk = calculatePlateauRisk(weights);
  
  if (risk > 70) return 'Consider deload week or technique focus';
  if (risk > 40) return 'Try different rep ranges or tempo';
  return 'Continue current progression';
};

const detectImbalances = (volumeDistribution) => {
  const imbalances = [];
  const total = Object.values(volumeDistribution).reduce((sum, vol) => sum + vol, 0);
  
  Object.entries(volumeDistribution).forEach(([group, volume]) => {
    const percentage = (volume / total) * 100;
    if (percentage < 10) {
      imbalances.push({ group, issue: 'undertrained', severity: 'medium' });
    } else if (percentage > 40) {
      imbalances.push({ group, issue: 'overtrained', severity: 'low' });
    }
  });
  
  return imbalances;
};

const generateBalanceRecommendations = (volumeDistribution) => {
  const imbalances = detectImbalances(volumeDistribution);
  
  return imbalances.map(imbalance => ({
    group: imbalance.group,
    recommendation: imbalance.issue === 'undertrained' 
      ? `Increase ${imbalance.group} training volume`
      : `Consider reducing ${imbalance.group} volume`,
    priority: imbalance.severity
  }));
};

// Additional missing functions used in calculateAdvancedMetrics
const calculateTrendAnalysis = (data) => {
  const volumes = data.map(d => d.volume || 0);
  return {
    trend: calculateLinearTrend(volumes),
    volatility: std(volumes),
    momentum: volumes.length > 1 ? volumes[volumes.length - 1] - volumes[volumes.length - 2] : 0
  };
};

const calculateSeasonality = (data) => {
  const monthlyData = _.groupBy(data, d => format(d.date, 'MM'));
  return Object.entries(monthlyData).map(([month, records]) => ({
    month: parseInt(month),
    avgVolume: mean(records.map(r => r.volume || 0)),
    workouts: records.length
  }));
};

const calculatePerformanceFactors = (data) => {
  return {
    consistency: calculateConsistencyScore(data),
    intensity: calculateAvgIntensity(data),
    variety: calculateExerciseVariety(data),
    progression: calculateOverallProgression(data)
  };
};

const calculateVolumeEfficiency = (data) => {
  const totalTime = data.reduce((sum, d) => sum + (d.workoutDuration || 60), 0);
  const totalVolume = data.reduce((sum, d) => sum + (d.volume || 0), 0);
  return totalTime > 0 ? totalVolume / totalTime : 0;
};

const calculateTimeEfficiency = (data) => {
  const workouts = _.groupBy(data, 'Date');
  const efficiencies = Object.values(workouts).map(workout => {
    const totalVolume = workout.reduce((sum, set) => sum + (set.volume || 0), 0);
    const duration = workout[0]?.workoutDuration || 60;
    return totalVolume / duration;
  });
  return mean(efficiencies);
};

const calculateIntensityDistribution = (data) => {
  const intensities = data.map(d => d.intensity || 0).filter(i => i > 0);
  return {
    low: intensities.filter(i => i < 60).length,
    medium: intensities.filter(i => i >= 60 && i < 80).length,
    high: intensities.filter(i => i >= 80).length,
    avg: mean(intensities)
  };
};

const calculateInjuryRisk = (data) => {
  // Simplified injury risk calculation
  const volumeSpikes = calculateVolumeSpikes(data);
  const formRegression = 0; // Placeholder
  const overtraining = detectOvertrainingMarkers(data);
  
  return {
    volumeSpikes,
    formRegression,
    overtraining,
    overall: (volumeSpikes + formRegression + overtraining) / 3
  };
};

const detectOvertraining = (data) => {
  const weeklyVolumes = calculateWeeklyVolume(data);
  if (weeklyVolumes.length < 4) return { risk: 0, indicators: [] };
  
  const recent4Weeks = weeklyVolumes.slice(-4);
  const trend = calculateLinearTrend(recent4Weeks.map(w => w.volume));
  
  return {
    risk: trend > 0.2 ? 70 : trend > 0.1 ? 40 : 10,
    indicators: trend > 0.2 ? ['Rapid volume increase', 'High fatigue risk'] : []
  };
};

const detectFormRegression = (data) => {
  // Placeholder for form regression detection
  return {
    risk: 20,
    exercises: [],
    recommendations: ['Focus on form over weight']
  };
};

// Helper functions for the above
const calculateConsistencyScore = (data) => {
  const dates = [...new Set(data.map(d => format(d.date, 'yyyy-MM-dd')))].sort();
  if (dates.length < 2) return 100;
  
  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    gaps.push(differenceInDays(new Date(dates[i]), new Date(dates[i - 1])));
  }
  
  const avgGap = mean(gaps);
  return Math.max(0, 100 - avgGap * 5);
};

const calculateAvgIntensity = (data) => {
  const intensities = data.map(d => d.intensity || 0).filter(i => i > 0);
  return intensities.length ? mean(intensities) : 0;
};

const calculateOverallProgression = (data) => {
  const exercises = _.groupBy(data, 'Exercise Name');
  const progressionRates = Object.values(exercises).map(calculateExerciseProgressionRate);
  return mean(progressionRates.filter(rate => !isNaN(rate)));
};

const calculateVolumeSpikes = (data) => {
  const weeklyVolumes = calculateWeeklyVolume(data);
  let spikes = 0;
  
  for (let i = 1; i < weeklyVolumes.length; i++) {
    const increase = (weeklyVolumes[i].volume - weeklyVolumes[i - 1].volume) / weeklyVolumes[i - 1].volume;
    if (increase > 0.3) spikes++; // 30% increase is considered a spike
  }
  
  return (spikes / Math.max(1, weeklyVolumes.length - 1)) * 100;
};

const detectOvertrainingMarkers = (data) => {
  const weeklyData = calculateWeeklyVolume(data);
  if (weeklyData.length < 3) return 0;
  
  const recent = weeklyData.slice(-3);
  const avgVolume = mean(recent.map(w => w.volume));
  const maxRecommended = avgVolume * 1.2; // 20% above average
  
  const overtrainingSessions = recent.filter(w => w.volume > maxRecommended).length;
  return (overtrainingSessions / recent.length) * 100;
};

// Prediction generation functions
const generateStrengthProjections = (data, analytics, userProfile) => {
  const exerciseStats = analytics.exerciseStats || {};
  const projections = {};
  
  Object.entries(exerciseStats).forEach(([exercise, stats]) => {
    const progressionRate = stats.progressionRate || 0;
    const currentMax = stats.maxWeight || 0;
    
    projections[exercise] = {
      '3m': Math.round(currentMax + (progressionRate * 12)),
      '6m': Math.round(currentMax + (progressionRate * 24)),
      '12m': Math.round(currentMax + (progressionRate * 48))
    };
  });
  
  return projections;
};

const generateVolumeProjections = (data, analytics) => {
  const weeklyTrends = analytics.weeklyTrends || [];
  if (weeklyTrends.length < 2) return { current: 0, projected: 0 };
  
  const currentVolume = weeklyTrends[weeklyTrends.length - 1]?.volume || 0;
  const growthRate = calculateLinearTrend(weeklyTrends.map(w => w.volume));
  
  return {
    current: currentVolume,
    '3m': Math.round(currentVolume + (growthRate * 12)),
    '6m': Math.round(currentVolume + (growthRate * 24)),
    '12m': Math.round(currentVolume + (growthRate * 48))
  };
};

const estimateBodyComposition = (data, analytics, userProfile) => {
  // Simplified body composition estimation
  const totalVolume = analytics.totalVolume || 0;
  const experience = userProfile.experience || 'beginner';
  
  const experienceMultiplier = {
    beginner: 1.2,
    intermediate: 1.0,
    advanced: 0.8,
    expert: 0.6
  };
  
  const multiplier = experienceMultiplier[experience];
  const estimatedMuscleGain = (totalVolume / 100000) * multiplier;
  
  return {
    estimatedMuscleGain: Math.round(estimatedMuscleGain * 10) / 10,
    confidence: Math.min(85, 60 + (analytics.totalWorkouts || 0) * 2)
  };
};

const generateInjuryPrevention = (analytics) => {
  const riskFactors = analytics.injuryRiskFactors || {};
  
  return {
    riskLevel: riskFactors.overall || 20,
    recommendations: [
      'Maintain proper form',
      'Include adequate rest days',
      'Progress weight gradually',
      'Focus on mobility work'
    ]
  };
};

const generateOptimalTraining = (analytics, userProfile) => {
  const weeklyTrends = analytics.weeklyTrends || [];
  const avgWorkouts = weeklyTrends.length > 0 
    ? mean(weeklyTrends.map(w => w.workouts)) 
    : 3;
  
  return {
    recommendedFrequency: Math.min(6, Math.max(3, Math.round(avgWorkouts * 1.1))),
    recommendedVolume: (analytics.totalVolume || 0) * 1.1,
    restDays: Math.max(1, 7 - Math.round(avgWorkouts * 1.1)),
    deloadWeek: 'Every 4-6 weeks'
  };
};

const generatePlateauPrevention = (analytics) => {
  const plateauData = analytics.plateauDetection || {};
  
  return {
    exercises: Object.entries(plateauData).map(([exercise, data]) => ({
      exercise,
      risk: data.plateauRisk || 0,
      recommendation: data.recommendations || 'Continue current plan'
    }))
  };
};

const generatePeriodizationPlan = (analytics, userProfile) => {
  const experience = userProfile.experience || 'beginner';
  
  const plans = {
    beginner: {
      phase1: 'Linear progression (4-6 weeks)',
      phase2: 'Volume increase (4-6 weeks)',
      phase3: 'Deload (1 week)',
      repeat: true
    },
    intermediate: {
      phase1: 'Hypertrophy block (6-8 weeks)',
      phase2: 'Strength block (4-6 weeks)',
      phase3: 'Peaking (2-3 weeks)',
      phase4: 'Deload (1 week)'
    },
    advanced: {
      phase1: 'Volume accumulation (8-12 weeks)',
      phase2: 'Intensity phase (4-6 weeks)',
      phase3: 'Realization (2-3 weeks)',
      phase4: 'Recovery (1-2 weeks)'
    }
  };
  
  return plans[experience] || plans.beginner;
};

const generateRecoveryOptimization = (analytics) => {
  const recoveryPatterns = analytics.recoveryPatterns || {};
  
  return {
    recommendations: [
      'Sleep 7-9 hours per night',
      'Stay hydrated (half body weight in oz)',
      'Include protein at every meal',
      'Take rest days seriously'
    ],
    optimalRestDays: Object.entries(recoveryPatterns).map(([group, pattern]) => ({
      muscleGroup: group,
      recommendedRest: pattern.optimalRecoveryTime || 48
    }))
  };
};

// Export all calculation functions
export {
  calculateTotalWorkouts,
  calculateTotalVolume,
  calculateVolumeOverTime,
  calculateStrengthOverTime,
  calculateExerciseStats,
  calculateMuscleGroupAnalysis
};