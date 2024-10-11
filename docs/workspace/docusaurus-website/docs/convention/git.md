# Git Convention

**Git** is a distributed source control system developed by Linus Torvalds in 2005 [1]. It is used to track the history changes of the source code in development, allowing software developers to collaborate on the project simultaneously and efficiently.

Throughout the project, we will use **Git** and **Github** as the source control for the project development in which having a clear set of Git convention rules for the project is crucial. Guidance on Commit Messages and Branch Naming will be discussed.

For **Commit Messages**, we might adopt the Conventional Commit specification which offers a set of rules for creating a clear commit history. According to Conventional Commit specification [2], commit messages should be structured as follows to describe the features, fixes, and breaking changes:


```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types** refers to the type of your commit actions:

- **feat**: Commits that include new features or remove existing features
- **fix**: Commits that fixes a bug
- **refactor**: Commits that rewrite or restructure the code, but does not change any API functionalities or their functional behaviours
- **perf**: Commits that improve the code performance
- **style**: Commits that change the syntax of codes
- **test**: Commits that add test cases or change existing test cases
- **docs**: Commits for change of documentations
- **build**: Commits that affect the build components, like build tool, pipeline, dependencies as well as project version
- **ops**: Commits that affect operational components like infrastructure, deployment, backup as well as recovery
- **chore**: general commits 

**Scopes** refer to the additional contextual information which is an optional part of the format.

**Breaking Changes** can be indicated by an ! symbol as a prefix for Types or Scopes:

```
feat!: add OAuth 2.0 for user authentications
```

**Description** should contain a clear summary for the code changes which is a compulsory part for the commit messages and a place to include issue identifiers and their relations. It should use imperative, present tense to describe the code changes.

**Body** should include the motivation for the change and the difference against the previous codes, which is an optional part for the commit message. 

**Footer** should contain information for Breaking Changes and to reference issues that a certain commit refers to. It is an optional part for the commit message. The footer should start with the word **BREAKING CHANGES**: if the commit action is a breaking change.

Examples for the commit messages:

```
feat!: remove feature for share message to Signal

refers to PANDA-1531

BREAKING CHANGES: messages can no longer be shared to Signal
```

```
fix(api): fix bug for ignoring null case in get message list endpoints
```

```
style: fix code syntax
```

```
refactor: extract common methods and put it in utils class
```

```
perf: reduce sql operations for forward message endpoints
```


**Branching** in gits allows the software developers to work on the same project with different features or changes together without affecting others' work. As there might be several developers with their branches active at the same time, it is critical to have a **branch naming convention** to maintain a clear and organised codebase.

According to ATLASSIAN[3], **branch management** can be maintained by adopting a Git branching model, which is Gitflow. It was a model published and made famous by Vincent Driessen at Vie. It involves the use of features and several primary branches. The main branch stores official release history through tagging, and the **develop** branch serves as an integration branch for features. The other branches can be structured as follows:

**Feature Branch** is the branch that stores the new feature, which has a prefix of **feature/**, **feat/** or **f/** with a precise description related to the feature that is under development, for example, feat/add-UserAuthentication. They can be merged into the **develop** branch through creating a pull request, once the development is completed.

**Hotfix Branch** is the branch that is used to fix bugs that the application produced in production, usually starting with prefix **fix/**, **bugfix/** or **hotfix/** (specifically for the urgent fix), followed by an identifier or issue description, this is the only branch that can be branched out from main. They can be merged into the **main** branch through creating a pull request, once the bug fixing is completed

**Release branches** are branched out from the development branch. Creating this branch starts the next release cycle. It starts with a prefix **release/**, following with the version number of the application. The release branch can be merged into **develop** and **main** branches through pull requests and tagged with the version number in the **main** branch once it is ready for production.

## References

[1] L. Torvalds, "Git: Fast Version Control System," 2005. [Online]. Available: https://gitscm.com/. [Accessed: Sept. 22, 2024].

[2] "Conventional Commits," Conventional Commits 1.0.0. [Online]. Available: https://www.conventionalcommits.org/en/v1.0.0/. [Accessed: Sep. 22, 2024].

[3] "Git branch best practices," Atlassian, 2024. [Online]. Available: https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow. [Accessed: Sep. 22, 2024].

