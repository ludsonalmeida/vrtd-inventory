import React from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Link,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ApiDocs() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        API Documentation
      </Typography>
      <Typography variant="body1" paragraph>
        Todas as rotas abaixo estão sob o prefixo <code>/api</code>.
      </Typography>

      {/* Auth */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Authentication</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mb={2}>
            <Typography variant="subtitle1"><code>POST /api/auth/login</code></Typography>
            <Typography variant="body2"><strong>Request:</strong></Typography>
            <pre style={{ background: '#000', color: '#fff', padding: 8 }}>
{`{
  "email": "user@example.com",
  "password": "senha123"
}`}
            </pre>
            <Typography variant="body2"><strong>Response:</strong></Typography>
            <pre style={{ background: '#000', color: '#fff', padding: 8 }}>
{`{
  "token": "<JWT>",
  "user": { "email":"user@example.com","role":"admin" }
}`}
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Divider />

      {/* Products */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Products</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {[
            {
              method: 'GET',
              path: '/api/products',
              desc: 'List all products',
              req: null,
              res: '[ { _id, name, supplier:{_id,name}, avgPrice, description } ]'
            },
            {
              method: 'POST',
              path: '/api/products',
              desc: 'Create a product',
              req: `{ "name":"...", "supplier":"<supplierId>", "avgPrice":0, "description":"" }`,
              res: `{ _id, name, supplier:{_id,name}, avgPrice, description }`
            },
            {
              method: 'PUT',
              path: '/api/products/:id',
              desc: 'Update a product',
              req: `{ "name":"...", "supplier":"<supplierId>", "avgPrice":0, "description":"" }`,
              res: `{ _id, name, supplier:{_id,name}, avgPrice, description }`
            },
            {
              method: 'DELETE',
              path: '/api/products/:id',
              desc: 'Delete a product',
              req: null,
              res: `{ success:true }`
            }
          ].map(ep => (
            <Box key={ep.path} mb={2}>
              <Typography variant="subtitle1">
                <code>{ep.method} {ep.path}</code> — {ep.desc}
              </Typography>
              {ep.req && <>
                <Typography variant="body2"><strong>Request Body:</strong></Typography>
                <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.req}</pre>
              </>}
              <Typography variant="body2"><strong>Response:</strong></Typography>
              <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.res}</pre>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
      <Divider />

      {/* Scan Invoice */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Scan Invoice</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mb={2}>
            <Typography variant="subtitle1">
              <code>POST /api/products/scan-invoice</code> — OCR + AI parse
            </Typography>
            <Typography variant="body2"><strong>Multipart Form:</strong></Typography>
            <pre style={{ background: '#000', color: '#fff', padding: 8 }}>
{`invoice: <file PDF|PNG>`}
            </pre>
            <Typography variant="body2"><strong>Response:</strong></Typography>
            <pre style={{ background: '#000', color: '#fff', padding: 8 }}>
{`{
  "products": [
    { "name":"Arroz", "quantity":2, "unitPrice":25.50, "totalPrice":51.00, "description":"" },
    …
  ]
}`}
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Divider />

      {/* Stock */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Stock Items</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {[
            {
              method: 'GET',
              path: '/api/stock',
              desc: 'List all stock items',
              res: '[ { _id, product:{_id,name}, category:{_id,name}, quantity, unit:{_id,name}, status } ]'
            },
            {
              method: 'POST',
              path: '/api/stock',
              desc: 'Create stock item',
              req: `{ "product":"<productId>", "category":"<catId>", "quantity":0, "unit":"<unitId>", "status":"N/A" }`,
              res: `{ _id, product:{_id,name}, ... }`
            },
            {
              method: 'PUT',
              path: '/api/stock/:id',
              desc: 'Update stock item',
              req: `{ "quantity":1, "status":"Baixo" }`,
              res: `{ _id, product:{_id,name}, ... }`
            },
            {
              method: 'DELETE',
              path: '/api/stock/:id',
              desc: 'Delete stock item',
              req: null,
              res: `{ success:true }`
            },
            {
              method: 'DELETE',
              path: '/api/stock',
              desc: 'Delete ALL stock items',
              req: null,
              res: `{ success:true }`
            }
          ].map(ep => (
            <Box key={ep.path} mb={2}>
              <Typography variant="subtitle1">
                <code>{ep.method} {ep.path}</code> — {ep.desc}
              </Typography>
              {ep.req && <>
                <Typography variant="body2"><strong>Request Body:</strong></Typography>
                <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.req}</pre>
              </>}
              <Typography variant="body2"><strong>Response:</strong></Typography>
              <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.res}</pre>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
      <Divider />

      {/* Contact */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Contact</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box mb={2}>
            <Typography variant="subtitle1">
              <code>POST /api/contact</code> — Send a message via WhatsApp
            </Typography>
            <Typography variant="body2"><strong>Request Body:</strong></Typography>
            <pre style={{ background: '#000', color: '#fff', padding: 8 }}>
{`{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "message": "Hello, I have a question about your service."
}`}
            </pre>
            <Typography variant="body2"><strong>Response:</strong></Typography>
            <pre style={{ background: '#000', color: '#fff', padding: 8 }}>
{`{
  "success": true,
  "message": "Message sent successfully."
}`}
            </pre>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Suppliers */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Suppliers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {[{
            method: 'GET',
            path: '/api/suppliers',
            desc: 'List all suppliers',
            res: '[ { _id, name, contactInfo } ]'
          }, {
            method: 'POST',
            path: '/api/suppliers',
            desc: 'Create a supplier',
            req: `{ "name": "Supplier Name", "contactInfo": "Contact Details" }`,
            res: `{ _id, name, contactInfo }`
          }, {
            method: 'PUT',
            path: '/api/suppliers/:id',
            desc: 'Update a supplier',
            req: `{ "name": "Updated Name", "contactInfo": "Updated Contact" }`,
            res: `{ _id, name, contactInfo }`
          }, {
            method: 'DELETE',
            path: '/api/suppliers/:id',
            desc: 'Delete a supplier',
            req: null,
            res: `{ success: true }`
          }].map(ep => (
            <Box key={ep.path} mb={2}>
              <Typography variant="subtitle1">
                <code>{ep.method} {ep.path}</code> — {ep.desc}
              </Typography>
              {ep.req && <>
                <Typography variant="body2"><strong>Request Body:</strong></Typography>
                <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.req}</pre>
              </>}
              <Typography variant="body2"><strong>Response:</strong></Typography>
              <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.res}</pre>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Categories */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {[{
            method: 'GET',
            path: '/api/categories',
            desc: 'List all categories',
            res: '[ { _id, name, description } ]'
          }, {
            method: 'POST',
            path: '/api/categories',
            desc: 'Create a category',
            req: `{ "name": "Category Name", "description": "Category Description" }`,
            res: `{ _id, name, description }`
          }, {
            method: 'PUT',
            path: '/api/categories/:id',
            desc: 'Update a category',
            req: `{ "name": "Updated Name", "description": "Updated Description" }`,
            res: `{ _id, name, description }`
          }, {
            method: 'DELETE',
            path: '/api/categories/:id',
            desc: 'Delete a category',
            req: null,
            res: `{ success: true }`
          }].map(ep => (
            <Box key={ep.path} mb={2}>
              <Typography variant="subtitle1">
                <code>{ep.method} {ep.path}</code> — {ep.desc}
              </Typography>
              {ep.req && <>
                <Typography variant="body2"><strong>Request Body:</strong></Typography>
                <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.req}</pre>
              </>}
              <Typography variant="body2"><strong>Response:</strong></Typography>
              <pre style={{ background: '#000', color: '#fff', padding: 8 }}>{ep.res}</pre>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
