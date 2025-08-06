import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, color: '#fff' }}>
      <Typography variant="h4" gutterBottom>
        Política de Privacidade e Proteção de Dados
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        Última atualização: 06 de agosto de 2025
      </Typography>

      <Typography variant="h6" gutterBottom>
        1. Quem somos
      </Typography>
      <Typography paragraph>
        A Porks Sobradinho (“nós”, “nosso”, “Porks”) é responsável pelo Clube do Chope. Nosso CNPJ: 34016994000156. E-mail para contato: <Link href="mailto:porks.sobradinho@gmail.com" sx={{ color: 'inherit' }}>porks.sobradinho@gmail.com</Link>.
      </Typography>

      <Typography variant="h6" gutterBottom>
        2. Dados que coletamos
      </Typography>
      <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
        <li>Dados Pessoais: nome, sobrenome, e-mail, telefone e CPF.</li>
        <li>Dados de Autenticação: quando você usar o Facebook Login, coletamos public_profile e e-mail via SDK do Facebook.</li>
      </Typography>

      <Typography variant="h6" gutterBottom>
        3. Finalidades do tratamento
      </Typography>
      <Typography paragraph>
        Coletamos e usamos seus dados para:
      </Typography>
      <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
        <li>Cadastrar e gerenciar sua conta no Clube do Chope;</li>
        <li>Confirmar sua identidade e facilitar o preenchimento do formulário;</li>
        <li>Entrar em contato para retirada do cartão e ações de marketing relacionadas;</li>
        <li>Cumprir obrigações legais e fiscais (ex.: emissão de nota fiscal).</li>
      </Typography>

      <Typography variant="h6" gutterBottom>
        4. Compartilhamento de dados
      </Typography>
      <Typography paragraph>
        Não vendemos, não trocamos e não compartilhamos seus dados pessoais com terceiros, exceto:
      </Typography>
      <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
        <li>Provedores de serviço (gateway de pagamento, e-mail marketing) que assinam contrato de confidencialidade;</li>
        <li>Autoridades judiciárias, à autoridade competente, quando exigido por lei.</li>
      </Typography>

      <Typography variant="h6" gutterBottom>
        5. Armazenamento e segurança
      </Typography>
      <Typography paragraph>
        Seus dados são armazenados em servidores seguros com acesso restrito. Utilizamos criptografia (HTTPS/TLS) e controles de acesso baseados em perfis.
      </Typography>

      <Typography variant="h6" gutterBottom>
        6. Prazo de retenção
      </Typography>
      <Typography paragraph>
        Mantemos seus dados enquanto sua conta estiver ativa ou conforme exigido por legislação fiscal e tributária (mínimo de 5 anos).
      </Typography>

      <Typography variant="h6" gutterBottom>
        7. Direitos dos titulares (LGPD)
      </Typography>
      <Typography paragraph>
        Você pode, a qualquer momento:
      </Typography>
      <Typography component="ul" sx={{ pl: 4, mb: 2 }}>
        <li>Solicitar acesso, correção, anonimização ou eliminação dos seus dados;</li>
        <li>Solicitar a portabilidade dos seus dados para outro fornecedor;</li>
        <li>Revogar seu consentimento para uso de dados para marketing;</li>
        <li>Apresentar reclamação à ANPD.</li>
      </Typography>

      <Typography variant="h6" gutterBottom>
        8. Cookies e tecnologias semelhantes
      </Typography>
      <Typography paragraph>
        Usamos cookies estritamente necessários para funcionamento do site e cookies de análise (Google Analytics) para melhorar sua experiência. Você pode desativá-los nas configurações do seu navegador.
      </Typography>

      <Typography variant="h6" gutterBottom>
        9. Alterações nesta Política
      </Typography>
      <Typography paragraph>
        Podemos revisar esta política periodicamente. A versão mais recente estará sempre disponível em <Link href="https://sobradinhoporks.com.br/politicas-de-privacidade" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>https://sobradinhoporks.com.br/politicas-de-privacidade</Link>.
      </Typography>
    </Box>
  );
}
