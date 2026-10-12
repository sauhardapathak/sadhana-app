/**
 * Lesson Detail + Quiz Screen
 * Phases: content → quiz (easy → medium → hard → extreme) → results
 */
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { DifficultyBadge } from '../../src/components/DifficultyBadge';
import { useTheme, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { QuizQuestion, QuestionDifficulty } from '../../src/types';

const DIFFICULTY_ORDER: QuestionDifficulty[] = ['easy', 'medium', 'hard', 'extreme'];

type Phase = 'content' | 'quiz' | 'results';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const t = useTheme();
  const router = useRouter();

  const lesson = state.lessons.find((l) => l.id === id);

  const [phase, setPhase] = useState<Phase>('content');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Questions sorted by difficulty. useMemo (not inline) so the early return
  // below never changes the hook order between renders.
  const questions: QuizQuestion[] = useMemo(
    () =>
      [...(lesson?.questions ?? [])].sort(
        (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
      ),
    [lesson]
  );

  const currentQ: QuizQuestion | undefined = questions[currentQIndex];

  const activeQuiz = state.activeQuiz;
  const savedQuiz = activeQuiz?.lessonId === lesson?.id ? activeQuiz : null;

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.divider,
    },
    topTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: t.textPrimary, textAlign: 'center' },
    scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

    contentTypeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    contentTypeLabel: { fontSize: FontSize.sm, color: t.textMuted },
    categoryLabel: { fontSize: FontSize.sm, color: t.primaryStrong, fontWeight: '700', marginLeft: Spacing.sm },
    lessonTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: t.textPrimary },
    bodyText: { fontSize: FontSize.md, color: t.textPrimary, lineHeight: 26 },
    audioSub: { fontSize: FontSize.sm, color: t.textMuted },

    resumeRow: { flexDirection: 'row', gap: Spacing.sm },
    resumeBtn: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: t.primaryStrong,
      borderRadius: Radius.md,
      paddingVertical: Spacing.sm,
    },
    resumeBtnText: { fontSize: FontSize.md, fontWeight: '700', color: t.textInverse },
    restartBtn: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: t.surfaceAlt,
      borderRadius: Radius.md,
      paddingVertical: Spacing.sm,
    },
    restartBtnText: { fontSize: FontSize.md, fontWeight: '700', color: t.textSecondary },

    quizProgress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quizProgressText: { fontSize: FontSize.sm, color: t.textSecondary, fontWeight: '600' },
    questionText: { fontSize: FontSize.xl, fontWeight: '700', color: t.textPrimary, lineHeight: 28 },
    optionsWrap: { gap: Spacing.sm },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      borderRadius: Radius.md,
      padding: Spacing.md,
      backgroundColor: t.surface,
      borderWidth: 2,
      borderColor: t.border,
    },
    optionSelected: { borderColor: t.primaryStrong, backgroundColor: '#FFF5ED' },
    optionCorrect: { borderColor: t.success, backgroundColor: '#F0FFF4' },
    optionWrong: { borderColor: t.error, backgroundColor: '#FFF5F5' },
    optionDim: { borderColor: t.divider, backgroundColor: t.background, opacity: 0.6 },
    optionLetter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: t.surfaceAlt,
      textAlign: 'center',
      lineHeight: 24,
      fontSize: FontSize.sm,
      fontWeight: '700',
      color: t.textSecondary,
    },
    optionText: { flex: 1, fontSize: FontSize.md, color: t.textPrimary },
    optionTextSelected: { color: t.primaryStrong, fontWeight: '600' },
    optionTextCorrect: { color: t.success, fontWeight: '600' },
    optionTextWrong: { color: t.error, fontWeight: '600' },
    optionTextDim: { color: t.textMuted },
    explanationCard: { backgroundColor: t.surfaceAlt },
    explanationHeading: { fontSize: FontSize.sm, fontWeight: '700', color: t.textSecondary, marginBottom: 4 },
    explanationText: { fontSize: FontSize.md, color: t.textPrimary, lineHeight: 22 },

    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      backgroundColor: t.primaryStrong,
      borderRadius: Radius.md,
      paddingVertical: Spacing.md,
      marginTop: Spacing.sm,
    },
    ctaButtonDisabled: { opacity: 0.4 },
    ctaButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: t.textInverse },

    resultsWrap: { alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
    resultsScore: { fontSize: 56, fontWeight: '800', color: t.textPrimary },
    resultsPercent: { fontSize: FontSize.xl, color: t.textSecondary, marginTop: -8 },
    resultsMessage: { fontSize: FontSize.lg, color: t.textSecondary, textAlign: 'center', lineHeight: 24 },
  });

  // NOTE: this must stay AFTER all hooks — an early return above them breaks
  // the Rules of Hooks and crashes when the id is invalid.
  if (!lesson) return null;

  function handleStartQuiz(resume = false) {
    if (resume && savedQuiz) {
      setCurrentQIndex(savedQuiz.qIndex);
      setCorrectAnswers(savedQuiz.correct);
    } else {
      setCurrentQIndex(0);
      setCorrectAnswers(0);
    }
    setSelectedOption(null);
    setRevealed(false);
    setPhase('quiz');
  }

  function handleSelectOption(idx: number) {
    if (revealed) return;
    setSelectedOption(idx);
  }

  function handleReveal() {
    if (!lesson) return;
    if (selectedOption === null || !currentQ) {
      Alert.alert('Select an answer first.');
      return;
    }
    setRevealed(true);
    const gained = selectedOption === currentQ.correctIndex ? 1 : 0;
    const nextCorrect = correctAnswers + gained;
    if (gained === 1) {
      setCorrectAnswers(nextCorrect);
      if (currentQ.difficulty === 'extreme') {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: 'a5' });
      }
    }
    dispatch({
      type: 'SAVE_QUIZ',
      lessonId: lesson.id,
      qIndex: currentQIndex,
      correct: nextCorrect,
    });
  }

  function handleNext() {
    if (!lesson || questions.length === 0) return;
    if (currentQIndex < questions.length - 1) {
      const nextIndex = currentQIndex + 1;
      dispatch({
        type: 'SAVE_QUIZ',
        lessonId: lesson.id,
        qIndex: nextIndex,
        correct: correctAnswers,
      });
      setCurrentQIndex(nextIndex);
      setSelectedOption(null);
      setRevealed(false);
    } else {
      const score = Math.round((correctAnswers / questions.length) * 100);
      dispatch({ type: 'COMPLETE_LESSON', id: lesson.id, score });
      dispatch({ type: 'CLEAR_QUIZ' });
      setPhase('results');
    }
  }

  function handleBackToLessons() {
    dispatch({ type: 'CLEAR_QUIZ' });
    router.back();
  }

  function getOptionStyle(idx: number) {
    if (!currentQ) return [styles.option];
    if (!revealed) {
      return [styles.option, selectedOption === idx ? styles.optionSelected : undefined];
    }
    if (idx === currentQ.correctIndex) return [styles.option, styles.optionCorrect];
    if (idx === selectedOption && idx !== currentQ.correctIndex) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  }

  function getOptionTextStyle(idx: number) {
    if (!currentQ) return [styles.optionText];
    if (!revealed) return [styles.optionText, selectedOption === idx ? styles.optionTextSelected : undefined];
    if (idx === currentQ.correctIndex) return [styles.optionText, styles.optionTextCorrect];
    if (idx === selectedOption && idx !== currentQ.correctIndex) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDim];
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={t.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ── CONTENT PHASE ── */}
      {phase === 'content' && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.contentTypeRow}>
            <Ionicons
              name={lesson.contentType === 'reading' ? 'book-outline' : 'headset-outline'}
              size={16}
              color={t.textMuted}
            />
            <Text style={styles.contentTypeLabel}>
              {lesson.contentType === 'reading' ? 'Reading' : 'Listening'}
            </Text>
            <Text style={styles.categoryLabel}>{lesson.category}</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          {lesson.bodyText ? (
            <Text style={styles.bodyText}>{lesson.bodyText}</Text>
          ) : null}

          {lesson.questions.length > 0 ? (
            <>
              {savedQuiz && (
                <View style={styles.resumeRow}>
                  <Pressable
                    style={styles.resumeBtn}
                    onPress={() => handleStartQuiz(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Resume quiz at question ${savedQuiz.qIndex + 1}`}
                  >
                    <Text style={styles.resumeBtnText}>Resume (Q{savedQuiz.qIndex + 1})</Text>
                  </Pressable>
                  <Pressable
                    style={styles.restartBtn}
                    onPress={() => handleStartQuiz(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Restart quiz"
                  >
                    <Text style={styles.restartBtnText}>Restart</Text>
                  </Pressable>
                </View>
              )}
              <Pressable style={styles.ctaButton} onPress={() => handleStartQuiz(false)}>
                <Text style={styles.ctaButtonText}>Start Questions</Text>
                <Ionicons name="arrow-forward" size={18} color={t.textInverse} />
              </Pressable>
            </>
          ) : (
            <Text style={styles.audioSub}>No questions for this lesson yet.</Text>
          )}
        </ScrollView>
      )}

      {/* ── QUIZ PHASE ── */}
      {phase === 'quiz' && currentQ && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Progress */}
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>
              Question {currentQIndex + 1} of {questions.length}
            </Text>
            <DifficultyBadge difficulty={currentQ.difficulty} />
          </View>

          <Text style={styles.questionText}>{currentQ.question}</Text>

          {/* Options */}
          <View style={styles.optionsWrap}>
            {currentQ.options.map((opt, idx) => (
              <Pressable
                key={idx}
                style={getOptionStyle(idx)}
                onPress={() => handleSelectOption(idx)}
                disabled={revealed}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + idx)}
                </Text>
                <Text style={getOptionTextStyle(idx)}>{opt}</Text>
                {revealed && idx === currentQ.correctIndex && (
                  <Ionicons name="checkmark-circle" size={18} color={t.success} style={{ marginLeft: 'auto' }} />
                )}
                {revealed && idx === selectedOption && idx !== currentQ.correctIndex && (
                  <Ionicons name="close-circle" size={18} color={t.error} style={{ marginLeft: 'auto' }} />
                )}
              </Pressable>
            ))}
          </View>

          {/* Explanation after reveal */}
          {revealed && (
            <Card style={styles.explanationCard}>
              <Text style={styles.explanationHeading}>Explanation</Text>
              <Text style={styles.explanationText}>{currentQ.explanation}</Text>
            </Card>
          )}

          {!revealed ? (
            <Pressable
              style={[styles.ctaButton, selectedOption === null && styles.ctaButtonDisabled]}
              onPress={handleReveal}
              disabled={selectedOption === null}
            >
              <Text style={styles.ctaButtonText}>Check Answer</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.ctaButton} onPress={handleNext}>
              <Text style={styles.ctaButtonText}>
                {currentQIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={t.textInverse} />
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* ── RESULTS PHASE ── */}
      {phase === 'results' && (
        <ScrollView contentContainerStyle={[styles.scroll, styles.resultsWrap]}>
          <Ionicons
            name={correctAnswers === questions.length ? 'trophy' : 'checkmark-circle'}
            size={64}
            color={correctAnswers === questions.length ? t.goldDeep : t.success}
          />
          <Text style={styles.resultsScore}>
            {correctAnswers} / {questions.length}
          </Text>
          <Text style={styles.resultsPercent}>
            {questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0}%
          </Text>
          <Text style={styles.resultsMessage}>
            {correctAnswers === questions.length
              ? 'Perfect! Excellent understanding. 🙏'
              : correctAnswers >= questions.length / 2
              ? 'Good effort. Reflect and revisit the lesson.'
              : 'Keep studying. Every reading is a step forward.'}
          </Text>
          <Pressable style={styles.ctaButton} onPress={handleBackToLessons}>
            <Ionicons name="arrow-back" size={18} color={t.textInverse} />
            <Text style={styles.ctaButtonText}>Back to Lessons</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
