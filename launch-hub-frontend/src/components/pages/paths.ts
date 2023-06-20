export const PATHS = {
  INDEX: "/",
  NEW_PROJECT_PAGE: "/new-project",
  NEW_PROJECT: {
    ABOUT_PROJECT: "/new-project/about-project",
    ABOUT_SBT: "/new-project/about-sbt",
    ABOUT_VAULT: "/new-project/about-vault",
  },
  PROJECTS: "/projects",
  PROJECT: (projectId: string) => `/projects/${projectId}`,
  API: {
    CUSTOM_TOKEN: "/api/custom-token",
  },
}
