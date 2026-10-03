/**
 * Lesson Detail + Quiz Screen
 * Phases: content → quiz (easy → medium → hard → extreme) → results
 */
import React, { useState } from 'react';
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
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { QuizQuestion, QuestionDifficulty } from '../../src/types';

const DIFFICULTY_ORDER: QuestionDifficulty[] = ['easy', 'medium', 'hard', 'extreme'];

type Phase = 'content' | 'quiz' | 'results';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const router = useRouter();

  const lesson = state.lessons.find((l) => l.id === id);
  if (!lesson) return null;

  const [phase, setPhase] = useState<Phase>('content');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Questions sorted by difficulty
  const questions = [...lesson.questions].sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
  );

  const currentQ: QuizQuestion | undefined = questions[currentQIndex];

  function handleStartQuiz() {
    setPhase('quiz');
    setCurrentQIndex(0);
    setSelectedOption(null);
    setRevealed(false);
    setCorrectAnswers(0);
  }

  function handleSelectOption(idx: number) {
    if (revealed) return;
    setSelectedOption(idx);
  }

  function handleReveal() {
    if (selectedOption === null || !currentQ) {
      Alert.alert('Select an answer first.');
      return;
    }
    setRevealed(true);
    if (selectedOption === currentQ.correctIndex) {
      setCorrectAnswers((c) => c + 1);
    }
  }

  function handleNext() {
    if (!lesson) return;
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((i) => i + 1);
      setSelectedOption(null);
      setRevealed(false);
    } else {
      const score = Math.round((correctAnswers / questions.length) * 100);
      dispatch({ type: 'COMPLETE_LESSON', id: lesson.id, score });
      setPhase('results');
    }
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
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
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
              color={Colors.textMuted}
            />
            <Text style={styles.contentTypeLabel}>
              {lesson.contentType === 'reading' ? 'Reading' : 'Listening'}
            </Text>
            <Text style={styles.categoryLabel}>{lesson.category}</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          {lesson.contentType === 'reading' && lesson.bodyText && (
            <Text style={styles.bodyText}>{lesson.bodyText}</Text>
          )}

          {lesson.contentType === 'listening' && (
            <Card style={styles.audioCard}>
              <Ionicons name="musical-notes-outline" size={48} color={Colors.primary} />
              <Text style={styles.audioLabel}>Audio player coming soon</Text>
              <Text style={styles.audioSub}>Duration: {lesson.durationMin ?? '?'} min</Text>
            </Card>
          )}

          <Pressable style={styles.ctaButton} onPress={handleStartQuiz}>
            <Text style={styles.ctaButtonText}>Start Questions</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.surface} />
          </Pressable>
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
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} style={{ marginLeft: 'auto' }} />
                )}
                {revealed && idx === selectedOption && idx !== currentQ.correctIndex && (
                  <Ionicons name="close-circle" size={18} color={Colors.error} style={{ marginLeft: 'auto' }} />
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
              <Ionicons name="arrow-forward" size={18} color={Colors.surface} />
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
            color={correctAnswers === questions.length ? Colors.gold : Colors.success}
          />
          <Text style={styles.resultsScore}>
            {correctAnswers} / {questions.length}
          </Text>
          <Text style={styles.resultsPercent}>
            {Math.round((correctAnswers / questions.length) * 100)}%
          </Text>
          <Text style={styles.resultsMessage}>
            {correctAnswers === questions.length
              ? 'Perfect! Excellent understanding. 🙏'
              : correctAnswers >= questions.length / 2
              ? 'Good effort. Reflect and revisit the lesson.'
              : 'Keep studying. Every reading is a step forward.'}
          </Text>
          <Pressable style={styles.ctaButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={Colors.surface} />
            <Text style={styles.ctaButtonText}>Back to Lessons</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topTitle: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  contentTypeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  contentTypeLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  categoryLabel: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', marginLeft: Spacing.sm },
  lessonTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  bodyText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 26 },
  audioCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  audioLabel: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  audioSub: { fontSize: FontSize.sm, color: Colors.textMuted },

  quizProgress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizProgressText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  questionText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, lineHeight: 28 },
  optionsWrap: { gap: Spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: '#FFF5ED' },
  optionCorrect: { borderColor: Colors.success, backgroundColor: '#F0FFF4' },
  optionWrong: { borderColor: Colors.error, backgroundColor: '#FFF5F5' },
  optionDim: { borderColor: Colors.divider, backgroundColor: Colors.background, opacity: 0.6 },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  optionText: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  optionTextSelected: { color: Colors.primary, fontWeight: '600' },
  optionTextCorrect: { color: Colors.success, fontWeight: '600' },
  optionTextWrong: { color: Colors.error, fontWeight: '600' },
  optionTextDim: { color: Colors.textMuted },
  explanationCard: { backgroundColor: Colors.surfaceAlt },
  explanationHeading: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  explanationText: { fontSize: FontSize.md, color: Colors.textPrimary, lineHeight: 22 },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  ctaButtonDisabled: { opacity: 0.4 },
  ctaButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.surface },

  resultsWrap: { alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  resultsScore: { fontSize: 56, fontWeight: '800', color: Colors.textPrimary },
  resultsPercent: { fontSize: FontSize.xl, color: Colors.textSecondary, marginTop: -8 },
  resultsMessage: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
