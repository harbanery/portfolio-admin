import PersonalDecorator from "./decorator";
import { formLayout } from "./config";

const PersonalPage = () => {
  return <PersonalDecorator formLayout={formLayout} />;
};

export default PersonalPage;
