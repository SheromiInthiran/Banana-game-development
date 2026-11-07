export const PLAYER_LEVELS = [
  { level: 1, name: 'Banana Beginner', minXp: 0, maxXp: 200, icon: '🌱', badge: 'Beginner Badge' },
  { level: 2, name: 'Banana Explorer', minXp: 200, maxXp: 500, icon: '🌴', badge: 'Explorer Badge' },
  { level: 3, name: 'Banana Master', minXp: 500, maxXp: 1000, icon: '🍌', badge: 'Master Badge' },
  { level: 4, name: 'Banana Champion', minXp: 1000, maxXp: 2000, icon: '🐒', badge: 'Champion Badge' },
  { level: 5, name: 'Banana Legend', minXp: 2000, maxXp: Infinity, icon: '👑', badge: 'Legend Crown' },
]

export const ALL_ACHIEVEMENTS = [
  {
    id: 'first_victory',
    title: 'First Victory',
    icon: '🍌',
    description: 'Solve your very first banana puzzle correctly.',
    condition: 'Solve 1 puzzle',
    badgeColor: '#facc15',
    rewardPoints: 25,
  },
  {
    id: 'first_100_pts',
    title: 'First 100 Points',
    icon: '💯',
    description: 'Reach 100 total banana points in your adventures.',
    condition: 'Earn 100 total points',
    badgeColor: '#22c55e',
    rewardPoints: 50,
  },
  {
    id: 'five_correct',
    title: '5 Correct Answers',
    icon: '🎯',
    description: 'Successfully solve 5 banana math puzzles.',
    condition: '5 correct answers',
    badgeColor: '#38bdf8',
    rewardPoints: 50,
  },
  {
    id: 'ten_games',
    title: '10 Games Completed',
    icon: '🎮',
    description: 'Play and finish 10 complete game rounds.',
    condition: 'Complete 10 games',
    badgeColor: '#a855f7',
    rewardPoints: 75,
  },
  {
    id: 'puzzle_master',
    title: 'Puzzle Master',
    icon: '🧩',
    description: 'Conquer a challenging Hard difficulty banana puzzle.',
    condition: 'Solve a Hard puzzle',
    badgeColor: '#ec4899',
    rewardPoints: 100,
  },
  {
    id: 'perfect_streak',
    title: 'Perfect Streak',
    icon: '🔥',
    description: 'Answer 5 puzzles correctly in a row without a mistake.',
    condition: '5-in-a-row streak',
    badgeColor: '#f97316',
    rewardPoints: 100,
  },
  {
    id: 'daily_champion',
    title: 'Daily Champion',
    icon: '☀️',
    description: 'Complete today’s magical Daily Jungle Quest.',
    condition: 'Finish Daily Challenge',
    badgeColor: '#eab308',
    rewardPoints: 75,
  },
  {
    id: 'banana_legend',
    title: 'Banana Legend',
    icon: '👑',
    description: 'Rise to the ultimate level: Level 5 Banana Legend.',
    condition: 'Reach Level 5 (2000+ pts)',
    badgeColor: '#e11d48',
    rewardPoints: 200,
  },
]

export function calculateLevel(xp = 0) {
  const currentXp = Math.max(0, Number(xp) || 0)
  for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
    if (currentXp >= PLAYER_LEVELS[i].minXp) {
      const current = PLAYER_LEVELS[i]
      const nextLevel = PLAYER_LEVELS[i + 1] || null
      const neededForNext = nextLevel ? nextLevel.minXp - currentXp : 0
      const currentRange = nextLevel ? nextLevel.minXp - current.minXp : 1000
      const progressInLevel = nextLevel ? currentXp - current.minXp : currentRange
      const progressPercent = Math.min(100, Math.round((progressInLevel / currentRange) * 100))

      return {
        level: current.level,
        levelName: current.name,
        icon: current.icon,
        badge: current.badge,
        currentXp,
        neededForNext,
        nextLevelXp: nextLevel ? nextLevel.minXp : current.minXp,
        progressPercent,
      }
    }
  }

  return {
    level: 1,
    levelName: 'Banana Beginner',
    icon: '🌱',
    badge: 'Beginner Badge',
    currentXp: 0,
    neededForNext: 200,
    nextLevelXp: 200,
    progressPercent: 0,
  }
}
