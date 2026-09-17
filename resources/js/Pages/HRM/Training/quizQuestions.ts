export interface QuizQuestionForm {
    question: string;
    options: string[];
    correct_option: number;
}

export function emptyQuestion(): QuizQuestionForm {
    return { question: '', options: ['', ''], correct_option: 0 };
}

export function useQuizQuestionHandlers(
    questions: QuizQuestionForm[],
    setQuestions: (questions: QuizQuestionForm[]) => void
) {
    const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
    const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));
    const updateQuestion = (index: number, field: keyof QuizQuestionForm, value: any) => {
        const next = [...questions];
        next[index] = { ...next[index], [field]: value };
        setQuestions(next);
    };
    const addOption = (qIndex: number) => {
        const next = [...questions];
        next[qIndex] = { ...next[qIndex], options: [...next[qIndex].options, ''] };
        setQuestions(next);
    };
    const removeOption = (qIndex: number, oIndex: number) => {
        const next = [...questions];
        const options = next[qIndex].options.filter((_, i) => i !== oIndex);
        let correct = next[qIndex].correct_option;
        if (correct >= options.length) correct = 0;
        next[qIndex] = { ...next[qIndex], options, correct_option: correct };
        setQuestions(next);
    };
    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const next = [...questions];
        const options = [...next[qIndex].options];
        options[oIndex] = value;
        next[qIndex] = { ...next[qIndex], options };
        setQuestions(next);
    };

    return { addQuestion, removeQuestion, updateQuestion, addOption, removeOption, updateOption };
}
