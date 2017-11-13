## Contributing to yieldable-json
Thanks for your interest in this project. Please refer to [https://github.com/ibmruntimes/yieldable-json](https://github.com/ibmruntimes/yieldable-json)
for details on the project description and the objective. Long term vision
of the project is to collaborate with a large group of developers,
implement and incorporate projects of similar objectives under this umbrella.

## Submitting a contribution
You can propose contributions by sending pull requests through GitHub. Following these guidelines
will help us to merge your pull requests smoothly:

1. It is generally a good idea to file an issue to explain your idea before
   writing code or submitting a pull request, though this is not mandatory.
2. Please read carefully and adhere to the legal considerations and
   copyright/license requirements outlined below.
3. Follow the coding style and format of the code you are modifying as the existing code base.
   The existing code base was built using eslint and eslint-config-strongloop (see package.json).
4. Follow the commit guidelines found below.
5. Ensure that `npm run pretest` and `npm run test` pass all tests before you submit a Pull Request.

## Commit Guidelines
Start the first line with the area of code or the feature which gets affected,
followed by a phrase or a fully formed sentence which describes the change made.
It is written in the imperative mood, say what happens when the patch is applied.
Keep it short and simple. The first line should be less than 50 characters,
sentence case, and does not end in a period. Leave a blank line between the
first line and the message body.

An example of the first line is:
`parser: remove user code from being evaluated`

The body should be wrapped at 72 characters, where reasonable.

Include as much information in your commit as possible. You may want to include
designs and rationale, examples and code, or issues and next steps. Prefer
copying resources into the body of the commit over providing external links.
Structure large commit messages with headers, references etc. Remember however
that the commit message is always going to be rendered in plain text.

It is important that you read and understand the legal considerations found
below when signing off or contributing any commit.

## Copyright Notice and Licensing Requirements
**It is the responsibility of each contributor to obtain legal advice, and
to ensure that their contributions fulfill the legal requirements of their
organization. This document is not legal advice.**

yieldable-json is licensed under the Apache License v2.0. Any previously
unlicensed contribution should be released under the same license.

* If you wish to contribute code under a different license, you must consult
with a committer before contributing.
* For any scenario not covered by this document, please discuss the copyright
notice and licensing requirements with a committer before contributing.

The template for the copyright notice and license is as follows:
```c
/*******************************************************************************
 *
 * <Insert appropriate copyright notice here>
 *
 *  This program and the accompanying materials are made available
 *  under the terms of the Apache License v2.0 which accompanies
 *  this distribution.
 *
 *      The Apache License v2.0 is available at
 *      http://www.opensource.org/licenses/apache2.0.php
 *
 * Contributors:
 *    <First author> - <description of contribution>
 *******************************************************************************/
```
