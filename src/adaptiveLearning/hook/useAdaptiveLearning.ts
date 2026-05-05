import { useMemo, useState } from 'react'

export type AdaptiveLevelAction = 'up' | 'keep' | 'down'
export type ReinforcementType = 'hint' | 'review-short' | 'review-simple'

export type AdaptiveLearningRuleConfig = {
  levelUpMinAccuracy: number
  keepMinAccuracy: number
  keepMaxAccuracy: number
  downgradeMaxAccuracy: number
  reinforcementAtTwoErrors: ReinforcementType
  reinforcementAtThreeErrors: ReinforcementType
}

export type AdaptiveLearningStats = {
  totalAnswers: number
  correctAnswers: number
  wrongAnswers: number
  correctStreak: number
  errorStreak: number
  accuracy: number
}

export type AdaptiveLearningDecision = {
  levelAction: AdaptiveLevelAction
  reinforcement: ReinforcementType | null
}

export type AdaptiveLearningState = AdaptiveLearningStats &
  AdaptiveLearningDecision & {
    currentLevel: number
  }

const DEFAULT_RULES: AdaptiveLearningRuleConfig = {
  levelUpMinAccuracy: 80,
  keepMinAccuracy: 50,
  keepMaxAccuracy: 79,
  downgradeMaxAccuracy: 49,
  reinforcementAtTwoErrors: 'review-short',
  reinforcementAtThreeErrors: 'review-simple',
}

const getAccuracy = (correctAnswers: number, totalAnswers: number) => {
  if (totalAnswers === 0) return 0
  return Math.round((correctAnswers / totalAnswers) * 100)
}

const decideLevelAction = (
  accuracy: number,
  rules: AdaptiveLearningRuleConfig
): AdaptiveLevelAction => {
  if (accuracy >= rules.levelUpMinAccuracy) return 'up'
  if (accuracy >= rules.keepMinAccuracy && accuracy <= rules.keepMaxAccuracy) {
    return 'keep'
  }
  if (accuracy <= rules.downgradeMaxAccuracy) return 'down'
  return 'keep'
}

const decideReinforcement = (
  errorStreak: number,
  rules: AdaptiveLearningRuleConfig
): ReinforcementType | null => {
  if (errorStreak >= 3) return rules.reinforcementAtThreeErrors
  if (errorStreak >= 2) return rules.reinforcementAtTwoErrors
  return null
}

export function useAdaptiveLearning(
  initialLevel = 1,
  customRules?: Partial<AdaptiveLearningRuleConfig>
) {
  const rules = useMemo(
    () => ({ ...DEFAULT_RULES, ...customRules }),
    [customRules]
  )

  const [state, setState] = useState<AdaptiveLearningState>({
    totalAnswers: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    correctStreak: 0,
    errorStreak: 0,
    accuracy: 0,
    currentLevel: initialLevel,
    levelAction: 'keep',
    reinforcement: null,
  })

  const recordAnswer = (isCorrect: boolean) => {
    setState((prev) => {
      const totalAnswers = prev.totalAnswers + 1
      const correctAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers
      const wrongAnswers = isCorrect ? prev.wrongAnswers : prev.wrongAnswers + 1
      const correctStreak = isCorrect ? prev.correctStreak + 1 : 0
      const errorStreak = isCorrect ? 0 : prev.errorStreak + 1
      const accuracy = getAccuracy(correctAnswers, totalAnswers)
      const levelAction = decideLevelAction(accuracy, rules)
      const reinforcement = decideReinforcement(errorStreak, rules)

      const currentLevel =
        levelAction === 'up'
          ? prev.currentLevel + 1
          : levelAction === 'down'
            ? Math.max(1, prev.currentLevel - 1)
            : prev.currentLevel

      return {
        totalAnswers,
        correctAnswers,
        wrongAnswers,
        correctStreak,
        errorStreak,
        accuracy,
        currentLevel,
        levelAction,
        reinforcement,
      }
    })
  }

  const resetAdaptiveLearning = (level = initialLevel) => {
    setState({
      totalAnswers: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      correctStreak: 0,
      errorStreak: 0,
      accuracy: 0,
      currentLevel: level,
      levelAction: 'keep',
      reinforcement: null,
    })
  }

  return {
    state,
    rules,
    recordAnswer,
    resetAdaptiveLearning,
  }
}
