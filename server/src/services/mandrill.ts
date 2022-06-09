import axios from "axios";
import { OrgType } from "../models/Org";
import User from "../models/User";

export type GlobalMergeVars = {
  name: string;
  content: string;
};

export const sendEmail = async (
  toEmail: string,
  fromEmail: string = "hi@mintlify.com",
  template_name: string = "doc-change-alert",
  global_merge_vars: GlobalMergeVars[] = []
) => {
  await axios.post("https://mandrillapp.com/api/1.0/messages/send-template", {
    key: process.env.MAILCHIMP_TRANSACTIONAL_KEY,
    template_name,
    template_content: [],
    message: {
      to: [{ email: toEmail }],
      from_email: fromEmail,
      from_name: fromEmail,
      merge_language: "handlebars",
      global_merge_vars,
    },
  });
}

export const sendEmailToAllMembersOfOrg = async (
  org: OrgType,
  fromEmail: string = "hi@mintlify.com",
  template_name: string = "doc-change-alert",
  global_merge_vars: GlobalMergeVars[] = []
) => {
  const users = await User.find({ userId: org.users });
  const formattedUsers = users.map((user) => {
   return { email: user.email };
  });
  await axios.post("https://mandrillapp.com/api/1.0/messages/send-template", {
    key: process.env.MAILCHIMP_TRANSACTIONAL_KEY,
    template_name,
    template_content: [],
    message: {
      to: formattedUsers,
      from_email: fromEmail,
      from_name: fromEmail,
      merge_language: "handlebars",
      global_merge_vars,
    },
  });
}
