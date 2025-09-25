# TODO: Fix Backend Import Error and Pydantic Warning

## Tasks
- [x] Fix import statements in backend/crud.py: Change relative imports to absolute imports
- [x] Update Pydantic Config in backend/schemas.py: Replace 'orm_mode' with 'from_attributes'
- [ ] Test backend startup to ensure no errors or warnings

## Details
- Import Error: crud.py uses relative imports causing issues when imported by main.py
- Pydantic Warning: 'orm_mode' deprecated in V2, use 'from_attributes'
