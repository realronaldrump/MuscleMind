import { mean, std } from 'mathjs';
import _ from 'lodash';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, differenceInCalendarDays, addMonths } from 'date-fns';
import regression from 'regression';

// --- DATA PROCESSING & ENRICHMENT ---

/**
 * Parses various duration strings (e.g., "1h 5m", "29m", "17s") into total minutes.
 * @param {string} durationStr - The duration string from the CSV.
 * @returns {number} Total duration in minutes.
 */
const parseDuration = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return 0;

  let totalMinutes = 0;
  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minMatch = durationStr.match(/(\d+)\s*m/);
  const secMatch = durationStr.match(/(\d+)\s*s/);

  if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
  if (secMatch) totalMinutes += parseInt(secMatch[1], 10) / 60;
  
  // Ensure non-negative duration
  return Math.max(0, totalMinutes);
};

/**
 * Calculates Estimated 1-Rep Max (E1RM) using the Brzycki formula.
 * More accurate for reps in the 1-10 range.
 * @param {number} weight - The weight lifted.
 * @param {number} reps - The number of repetitions.
 * @returns {number} The estimated 1-Rep Max.
 */
export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || reps < 1 || weight <= 0) return 0;
  if (reps === 1) return weight;
  
  // Brzycki formula for reps <= 10
  if (reps <= 10) {
    return weight / (1.0278 - 0.0278 * reps);
  }
  
  // Epley formula for reps > 10
  return weight * (1 + 0.033 * reps);
};

/**
 * Determines the primary muscle group for a given exercise.
 * @param {string} exerciseName - The name of the exercise.
 * @returns {string} The identified muscle group.
 */
export const getMuscleGroup = (exerciseName) => {
  const exercise = exerciseName.toLowerCase();
  const muscleMap = {
    chest: ['chest', 'bench', 'press', 'fly', 'dip'],
    back: ['back', 'row', 'pulldown', 'pull-up', 'deadlift', 'lat'],
    shoulders: ['shoulder', 'overhead', 'lateral', 'rear delt', 'face pull'],
    biceps: ['bicep', 'curl'],
    triceps: ['tricep', 'triceps', 'pushdown', 'extension'],
    quads: ['squat', 'leg press', 'leg extension', 'lunge'],
    hamstrings: ['hamstring', 'leg curl', 'romanian deadlift', 'rdl'],
    glutes: ['glute', 'hip thrust', 'kickback', 'abductor'],
    calves: ['calf', 'calve'],
    core: ['abs', 'plank', 'crunch', 'core', 'leg raise'],
  };

  for (const [group, keywords] of Object.entries(muscleMap)) {
    if (keywords.some(keyword => exercise.includes(keyword))) {
      return group;
    }
  }
  return 'compound'; // Default for exercises like Deadlift that hit multiple groups
};

/**
 * Cleans and enriches raw workout data from the CSV.
 * @param {Array<Object>} rawData - The raw data parsed from CSV.
 * @returns {Array<Object>} The processed and enriched data.
 */
export const processWorkoutData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];

  const workoutSets = rawData
    .filter(row => {
      // Filter out invalid entries and rest timers
      return row.Date && 
             row['Exercise Name'] && 
             row['Exercise Name'] !== 'Rest Timer' && 
             row.Reps > 0 && 
             row.Weight >= 0;
    })
    .map((row, index) => {
      const weight = parseFloat(row.Weight) || 0;
      const reps = parseInt(row.Reps, 10) || 0;
      const dateString = row.Date || '';
      
      // Ensure proper date parsing with timezone handling
      const date = parseISO(dateString.replace(' ', 'T') + 'Z');
      
      return {
        ...row,
        id: `${dateString}-${index}`,
        date: date,
        weight: weight,
        reps: reps,
        volume: weight * reps,
        e1rm: calculate1RM(weight, reps),
        muscleGroup: getMuscleGroup(row['Exercise Name']),
        workoutDuration: parseDuration(row.Duration),
      };
    })
    .sort((a, b) => a.date - b.date);

  // Group by workout session to correctly calculate duration for each set
  const workouts = _.groupBy(workoutSets, r => r['Workout Name'] + '_' + r.date.toISOString().split('T')[0]);
  return Object.values(workouts).flat();
};

/**
 * NEW: Retrieves the E1RM history for a specific exercise.
 * @param {string} exerciseName - The name of the exercise.
 * @param {Array<Object>} processedData - The cleaned and enriched workout data.
 * @returns {Array<Object>} An array of { date, value } for charting.
 */
export const getExerciseHistory = (exerciseName, processedData) => {
    if (!exerciseName || !processedData) return [];
    return processedData
        .filter(d => d['Exercise Name'] === exerciseName && d.e1rm > 0)
        .map(d => ({
            date: d.date.toISOString().split('T')[0],
            value: Math.round(d.e1rm)
        }))
        // Consolidate to max e1rm per day to avoid noisy charts
        .reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
                existing.value = Math.max(existing.value, curr.value);
            } else {
                acc.push(curr);
            }
            return acc;
        }, [])
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};


// --- ADVANCED ANALYTICS ENGINE ---

/**
 * Calculates a comprehensive set of metrics from processed workout data.
 * @param {Array<Object>} processedData - The cleaned and enriched workout data.
 * @param {Object} userProfile - The user's profile information.
 * @returns {Object|null} A comprehensive analytics object.
 */
export const calculateAdvancedMetrics = (processedData, userProfile = {}) => {
  if (!processedData || processedData.length === 0) return null;

  const workoutDates = _.uniq(processedData.map(d => d.date.toISOString().split('T')[0])).map(d => parseISO(d));
  const exerciseStats = calculateExerciseStats(processedData);
  const dailyMetrics = calculateDailyMetrics(processedData);
  const fitnessFatigue = calculateFitnessFatigueModel(dailyMetrics);

  // Calculate average workout duration
  const uniqueWorkouts = _.groupBy(processedData, r => r['Workout Name'] + '_' + r.date.toISOString().split('T')[0]);
  const workoutDurations = Object.values(uniqueWorkouts).map(workout => {
    const firstSet = workout[0];
    return firstSet.workoutDuration || 0;
  });
  const avgWorkoutDuration = workoutDurations.length > 0 ? _.mean(workoutDurations) : 0;

  return {
    totalWorkouts: workoutDates.length,
    totalVolume: _.sumBy(processedData, 'volume'),
    totalSets: processedData.length,
    firstWorkoutDate: processedData[0].date,
    lastWorkoutDate: processedData[processedData.length - 1].date,
    avgWorkoutDuration: avgWorkoutDuration,
    
    volumeOverTime: dailyMetrics.map(d => ({ date: d.date, volume: d.totalVolume })),
    exerciseStats: exerciseStats,
    muscleGroups: calculateMuscleGroupAnalysis(processedData, exerciseStats),
    
    fitnessFatigue: fitnessFatigue, // CTL, ATL, TSB
    
    weeklyTrends: calculateWeeklyTrends(dailyMetrics),
    consistency: calculateConsistency(workoutDates),
  };
};

function calculateExerciseStats(data) {
  const exercises = _.groupBy(data, 'Exercise Name');
  const exerciseStats = {};

  for (const name in exercises) {
    const sets = exercises[name];
    const progressionData = sets.map(s => [differenceInCalendarDays(s.date, data[0].date), s.e1rm]).filter(d => d[1] > 0);
    
    let progression = { slope: 0, r2: 0, standardError: 0 };
    if (progressionData.length > 2) {
      const result = regression.linear(progressionData, { precision: 4 });
      progression.slope = result.equation[0]; // Daily gain
      progression.r2 = result.r2;
      
      // Calculate standard error of the estimate
      const predictions = progressionData.map(p => result.predict(p[0])[1]);
      const residuals = progressionData.map((p, i) => p[1] - predictions[i]);
      const sse = residuals.reduce((sum, r) => sum + r*r, 0);
      progression.standardError = Math.sqrt(sse / (progressionData.length - 2));

    }

    const maxWeightSet = _.maxBy(sets, 'weight');
    const maxE1RMSet = _.maxBy(sets, 'e1rm');

    exerciseStats[name] = {
      name,
      sets: sets.length,
      totalVolume: _.sumBy(sets, 'volume'),
      maxWeight: maxWeightSet ? maxWeightSet.weight : 0,
      maxE1RM: maxE1RMSet ? maxE1RMSet.e1rm : 0,
      progression: {
        dailyE1RMGain: progression.slope,
        weeklyE1RMGain: progression.slope * 7, // Convert daily slope to weekly
        confidence: progression.r2, // R-squared value
        standardError: progression.standardError,
      },
      lastPerformed: _.maxBy(sets, 'date').date,
      muscleGroup: sets[0].muscleGroup,
    };
  }
  return exerciseStats;
}

function calculateDailyMetrics(data) {
  const days = _.groupBy(data, d => d.date.toISOString().split('T')[0]);
  return Object.entries(days).map(([date, sets]) => {
    const totalVolume = _.sumBy(sets, 'volume');
    const avgIntensity = _.meanBy(sets, s => (s.weight / s.e1rm) * 100 || 75);
    // Training Stress Score (TSS) simplified for strength
    const tss = (totalVolume / 1000) * (avgIntensity / 100) * (sets.length / 15);

    return {
      date: date,
      totalVolume: totalVolume,
      sets: sets.length,
      tss: tss,
    };
  }).sort((a,b) => new Date(a.date) - new Date(b.date));
}

function calculateFitnessFatigueModel(dailyMetrics) {
    const ctl_alpha = 1 - Math.exp(-1 / 42); // Chronic Training Load (Fitness)
    const atl_alpha = 1 - Math.exp(-1 / 7);  // Acute Training Load (Fatigue)
    let ctl = 0;
    let atl = 0;

    const model = [];
    let lastDate = dailyMetrics.length > 0 ? parseISO(dailyMetrics[0].date) : new Date();

    dailyMetrics.forEach(day => {
        const currentDate = parseISO(day.date);
        const daysSinceLast = differenceInCalendarDays(currentDate, lastDate);

        // Decay CTL and ATL for rest days
        if (daysSinceLast > 1) {
            ctl *= Math.pow(1 - ctl_alpha, daysSinceLast - 1);
            atl *= Math.pow(1 - atl_alpha, daysSinceLast - 1);
        }

        ctl = (day.tss * ctl_alpha) + (ctl * (1 - ctl_alpha));
        atl = (day.tss * atl_alpha) + (atl * (1 - atl_alpha));
        
        model.push({
            date: day.date,
            ctl: ctl, // Fitness
            atl: atl, // Fatigue
            tsb: ctl - atl, // Form/Readiness
            tss: day.tss
        });
        lastDate = currentDate;
    });
    return model;
}

function calculateMuscleGroupAnalysis(data, exerciseStats) {
  const analysis = {};
  const muscleGroups = _.groupBy(data, 'muscleGroup');

  for (const group in muscleGroups) {
    const sets = muscleGroups[group];
    const exercisesInGroup = _.uniq(sets.map(s => s['Exercise Name']));
    const progressionRates = exercisesInGroup.map(ex => exerciseStats[ex]?.progression.weeklyE1RMGain || 0).filter(r => r > 0);

    analysis[group] = {
      name: group,
      totalVolume: _.sumBy(sets, 'volume'),
      sets: sets.length,
      exercises: exercisesInGroup,
      avgProgression: progressionRates.length > 0 ? _.mean(progressionRates) : 0,
    };
  }
  return analysis;
}

function calculateWeeklyTrends(dailyMetrics) {
    const weeks = _.groupBy(dailyMetrics, d => format(startOfWeek(parseISO(d.date)), 'yyyy-MM-dd'));
    return Object.entries(weeks).map(([week, days]) => ({
        week,
        volume: _.sumBy(days, 'totalVolume'),
        workouts: days.length,
        avgTSS: _.meanBy(days, 'tss'),
    })).sort((a, b) => new Date(a.week) - new Date(b.week));
}

function calculateConsistency(workoutDates) {
    if (workoutDates.length < 2) return { score: 100, avgGap: 0, longestStreak: workoutDates.length };

    let gaps = [];
    let streaks = [];
    let currentStreak = 1;

    for (let i = 1; i < workoutDates.length; i++) {
        const gap = differenceInCalendarDays(workoutDates[i], workoutDates[i-1]);
        gaps.push(gap);
        if (gap === 1) {
            currentStreak++;
        } else {
            streaks.push(currentStreak);
            currentStreak = 1;
        }
    }
    streaks.push(currentStreak);

    const avgGap = _.mean(gaps);
    // Score: 100 for daily training, ~0 for weekly training
    const score = Math.max(0, 100 - (avgGap - 1) * 15);

    return {
        score: Math.round(score),
        avgGap: parseFloat(avgGap.toFixed(1)),
        longestStreak: Math.max(...streaks, 0)
    };
}


// --- PREDICTION ENGINE ---

/**
 * Generates a full suite of predictions based on analytics.
 * @param {Object} analytics - The comprehensive analytics object.
 * @param {Object} userProfile - The user's profile information.
 * @returns {Object|null} A comprehensive predictions object.
 */
export const generatePredictions = (analytics, userProfile = {}) => {
  if (!analytics || !analytics.exerciseStats) return null;

  return {
    strengthProjections: generateStrengthProjections(analytics),
    hypertrophyPotential: calculateHypertrophyPotential(analytics),
    futureReadiness: projectFitnessFatigue(analytics),
  };
};

function generateStrengthProjections(analytics) {
  const projections = {};
  const { exerciseStats } = analytics;

  Object.values(exerciseStats).forEach(exercise => {
    if (exercise.progression.confidence < 0.3) return; // Skip if progression is not predictable

    const { weeklyE1RMGain, standardError } = exercise.progression;
    const currentE1RM = exercise.maxE1RM;
    
    // More advanced diminishing returns based on training age and current strength
    const trainingAgeInMonths = differenceInDays(new Date(), analytics.firstWorkoutDate) / 30;
    const diminishingFactor = Math.exp(-0.02 * trainingAgeInMonths); // Exponential decay
    const adjustedGain = weeklyE1RMGain * diminishingFactor;

    if (adjustedGain <= 0) return;

    projections[exercise.name] = {
      name: exercise.name,
      currentE1RM: Math.round(currentE1RM),
      progression: exercise.progression,
      diminishingFactor: diminishingFactor,
      timeframes: [3, 6, 12].map(months => {
        const weeks = months * 4.33;
        const predictedGain = adjustedGain * weeks;
        const predictedE1RM = currentE1RM + predictedGain;
        
        // Use standard error to create a confidence interval
        const predictionError = standardError * Math.sqrt(weeks);
        
        return {
          months,
          predictedE1RM: Math.round(predictedE1RM),
          range: [
            Math.round(predictedE1RM - predictionError),
            Math.round(predictedE1RM + predictionError)
          ]
        };
      })
    };
  });
  return projections;
}

function calculateHypertrophyPotential(analytics) {
    const { muscleGroups, weeklyTrends } = analytics;
    const scores = {};
    const recommendations = [];

    const last4Weeks = weeklyTrends.slice(-4);
    if (last4Weeks.length === 0) return { overallScore: 0, scores: {}, recommendations: ["Not enough data."] };

    const avgWeeklyVolume = _.meanBy(last4Weeks, 'volume');
    
    // 1. Volume Score
    const volumeScore = Math.min(100, (avgWeeklyVolume / 30000) * 100); // Target 30k weekly volume for max score
    if (volumeScore < 50) recommendations.push("Increase total weekly volume for better muscle growth stimulus.");

    // 2. Progressive Overload Score
    const volumeTrend = regression.linear(last4Weeks.map((w, i) => [i, w.volume])).equation[0];
    const overloadScore = Math.max(0, Math.min(100, 50 + (volumeTrend / 50))); // Center score at 50, scaled
    if (overloadScore < 50) recommendations.push("Focus on progressively increasing your workout volume over time.");

    // 3. Muscle Group Balance Score
    const groupVolumes = Object.values(muscleGroups).map(g => g.totalVolume);
    const balanceScore = (1 - (std(groupVolumes) / mean(groupVolumes))) * 100;
    if (balanceScore < 60) {
        const weakestGroup = _.minBy(Object.values(muscleGroups), 'totalVolume');
        recommendations.push(`Improve muscle balance by adding more volume to your ${weakestGroup.name}.`);
    }

    const overallScore = Math.round((volumeScore + overloadScore + balanceScore) / 3);

    return {
        overallScore,
        scores: {
            volume: Math.round(volumeScore),
            progression: Math.round(overloadScore),
            balance: Math.round(balanceScore)
        },
        recommendations,
        details: {
            avgWeeklyVolume: Math.round(avgWeeklyVolume),
            volumeTrend: parseFloat(volumeTrend.toFixed(2))
        }
    };
}

function projectFitnessFatigue(analytics) {
    const { fitnessFatigue, weeklyTrends } = analytics;
    if (fitnessFatigue.length === 0 || weeklyTrends.length === 0) return [];

    const lastState = fitnessFatigue[fitnessFatigue.length - 1];
    const avgWeeklyTSS = _.meanBy(weeklyTrends.slice(-4), 'avgTSS') * 7; // Avg total weekly TSS
    const avgWorkoutsPerWeek = _.meanBy(weeklyTrends.slice(-4), 'workouts');
    
    // Distribute avg weekly TSS over avg workout days
    const avgTSSPerWorkout = avgWorkoutsPerWeek > 0 ? avgWeeklyTSS / avgWorkoutsPerWeek : 0;
    const workoutInterval = avgWorkoutsPerWeek > 0 ? Math.round(7 / avgWorkoutsPerWeek) : 7;

    let { ctl, atl } = lastState;
    const projection = [];
    const ctl_alpha = 1 - Math.exp(-1 / 42);
    const atl_alpha = 1 - Math.exp(-1 / 7);

    for (let day = 1; day <= 90; day++) {
        const tss = (day % workoutInterval === 0) ? avgTSSPerWorkout : 0;
        ctl = (tss * ctl_alpha) + (ctl * (1 - ctl_alpha));
        atl = (tss * atl_alpha) + (atl * (1 - atl_alpha));
        projection.push({
            day: day,
            date: format(addMonths(new Date(), day / 30), 'yyyy-MM-dd'),
            ctl: ctl,
            atl: atl,
            tsb: ctl - atl
        });
    }
    return projection;
}