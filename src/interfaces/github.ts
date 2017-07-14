export namespace Github {
  export namespace Content {
    export interface IContent {
      type: string;
      target?: string; // type == symlink
      submodule_git_url?: string; // type == submodule
      encoding?: string;
      size: number;
      name: string;
      path: string;
      content?: string; // type == file && get content
      sha: string;
      url: string;
      git_url: string;
      html_url: string;
      download_url: string;
      _links: {
        git: string;
        self: string;
        html: string;
      }
    }
  }
}
