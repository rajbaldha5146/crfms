import CreateFeedbackPage from "../../components/feedback/CreateFeedbackPage";

/**
 * Senior Developer create feedback — redirects to Senior user workspace after submit.
 */
const SeniorCreateFeedbackPage = () => (
  <CreateFeedbackPage
    onSuccessRedirect={(projectId, revieweeUserId) =>
      `/senior/projects/${projectId}/users/${revieweeUserId}`
    }
  />
);

export default SeniorCreateFeedbackPage;
