import { body } from 'express-validator';

const nameValidation = body('name')
  .isString()
  .withMessage('name should be string')
  .trim()
  .isLength({ min: 1, max: 15 })
  .withMessage('Length of name is not correct');

const descriptionValidation = body('description')
  .isString()
  .withMessage('description should be string')
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage('Length of description is not correct');

const websiteUrl = body('websiteUrl')
  .isString()
  .withMessage('website url is required')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('Length of website is not correct')
  .isURL({
    protocols: ['https'],
    require_protocol: true,
    require_tld: true,
    allow_underscores: true,
    allow_trailing_dot: false,
    allow_query_components: false,
    allow_fragments: false,
  })
  .withMessage('website url has invalid format');

export const blogsInputDtoValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrl,
];
