import { body } from 'express-validator';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';

const nameValidation = body('title')
  .isString()
  .withMessage('title should be string')
  .trim()
  .isLength({ min: 1, max: 30 })
  .withMessage('Length of title is not correct');

const descriptionValidation = body('shortDescription')
  .isString()
  .withMessage('shortDescription should be string')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('Length of short description is not correct');

const websiteUrl = body('content')
  .isString()
  .withMessage('content url is required')
  .trim()
  .isLength({ min: 1, max: 1000 })
  .withMessage('Length of content is not correct');

const blogId = body('blogId')
  .isString()
  .withMessage('content blogId is required')
  .trim()
  .isLength({ min: 1 })
  .withMessage('Length of blogId is not correct')
  .bail()
  .custom((value) => {
    const blog = blogsRepository.findById(value);
    if (!blog) {
      throw new Error('Blog with specified blogId does not exist');
    }
    return true;
  });

export const postInputDtoValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrl,
  blogId,
];
