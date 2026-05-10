const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { getMemberBorrows } = require('../controllers/borrowController');

router.get('/', getAllMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

// Relationship endpoint: list all borrows for a member
router.get('/:memberId/borrows', getMemberBorrows);

module.exports = router;
