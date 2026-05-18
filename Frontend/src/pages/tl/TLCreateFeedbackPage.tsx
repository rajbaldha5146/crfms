import CreateFeedbackPage from "../../components/feedback/CreateFeedbackPage";

/**
 * TL create feedback — redirects to TL user workspace after submit.
 */
const TLCreateFeedbackPage = () => (
  <CreateFeedbackPage
    onSuccessRedirect={(projectId, revieweeUserId) =>
      `/tl/projects/${projectId}/users/${revieweeUserId}`
    }
  />
);

export default TLCreateFeedbackPage;
