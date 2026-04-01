import Comment from './Comment';

export default function CommentList({ comments = [], ...props }) {
  if (comments.length === 0) {
    return <div className="text-gray-500 text-sm mt-4">No comments yet. Be the first!</div>;
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-lg bg-white overflow-hidden">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} {...props} />
      ))}
    </div>
  );
}
