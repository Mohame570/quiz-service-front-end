import { PaginatedQuizData, QuizStatus } from '@/types/quiz/admin';
import { QUIZ_STATUS_COLOR } from '@/lib/quiz-status';
import QuizCardActions from './QuizActions';
import QuizTablePagination from './QuizTablePagination';

const COLOR_CLASS_NAMES: Record<(typeof QUIZ_STATUS_COLOR)[QuizStatus], string> = {
  success: 'text-success before:bg-success',
  warning: 'text-warning before:bg-warning',
  destructive: 'text-destructive before:bg-destructive',
  'muted-foreground': 'text-muted-foreground before:bg-muted-foreground',
};

function getStatusClassName(status: QuizStatus) {
  return COLOR_CLASS_NAMES[QUIZ_STATUS_COLOR[status]];
}

function DashboardQuizTable({ data }: { data: PaginatedQuizData }) {
  const { quizzes, page, totalItems, totalPages, hasNextPage, hasPreviousPage } = data;

  return (
    <section className="quiz-table-card" aria-label="Quiz table">
      <div className="quiz-table-scroll">
        <table className="quiz-table">
          <thead>
            <tr>
              <th scope="col">Quiz Title</th>
              {/* <th scope="col">Category</th> */}
              {/* <th scope="col">Questions</th> */}
              {/* <th scope="col">Total Plays</th> */}
              <th scope="col">Status</th>
              <th scope="col" className="text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <div className="quiz-title-cell">
                      {/* <span
                        className={`quiz-thumbnail bg-linear-to-br ${quiz.thumbnailClassName}`}
                        aria-hidden="true"
                      /> */}
                      <span>
                        <span className="quiz-row-title">{quiz.title}</span>
                        {/* <span className="quiz-row-meta">{quiz.activity}</span> */}
                      </span>
                    </div>
                  </td>
                  {/* <td><span className="quiz-category-pill">{quiz.category}</span></td> */}
                  {/* <td className="text-center">{quiz.questions}</td> */}
                  {/* <td>{quiz.totalPlays}</td> */}
                  <td>
                    <span className={`quiz-status ${getStatusClassName(quiz.status)}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td>
                    <div className="quiz-table-actions">
                      <QuizCardActions id={quiz.id} title={quiz.title} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-small text-muted-foreground">
                  No quizzes match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quiz-table-footer text-small">
        <p>
          Showing <strong>{quizzes.length}</strong> of <strong>{totalItems}</strong> quizzes
        </p>
        <QuizTablePagination
          page={page}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      </div>
    </section>
  );
}

export default DashboardQuizTable;
