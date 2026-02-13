import { useState, useEffect } from 'react'
import './Localizacao.sass'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa'
import { CreateLocalizacaoModal } from './CreateLocalizacaoModal'
import { EditLocalizacaoModal } from './EditLocalizacaoModal'
import { listLocalizacoes, deleteLocalizacao } from './location.service'
import { Localizacao as LocalizacaoType } from './location.types'
import { useIsMobile } from '../../shared/utils/useIsMobile'
import { useToast } from '../../shared/contexts/ToastContext'
import LocalizacaoMobile from './LocalizacaoMobile'

function Localizacao() {
  const isMobile = useIsMobile()
  if (isMobile) return <LocalizacaoMobile />
  return <LocalizacaoDesktop />
}

function LocalizacaoDesktop() {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLocalizacao, setSelectedLocalizacao] = useState<LocalizacaoType | null>(null)

  useEffect(() => {
    loadLocalizacoes()
  }, [])

  const loadLocalizacoes = async () => {
    try {
      setLoading(true)
      const data = await listLocalizacoes()
      setLocalizacoes(data)
    } catch (error) {
      console.error('Erro ao carregar localizações:', error)
      toast.error('Erro ao carregar localizações')
    } finally {
      setLoading(false)
    }
  }

  const filteredLocalizacoes = localizacoes.filter(localizacao =>
    localizacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    localizacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedLocalizacao(null)
    setIsCreateModalOpen(true)
  }

  const handleEdit = (id: string) => {
    const localizacao = localizacoes.find(l => l.id === id)
    if (localizacao) {
      setSelectedLocalizacao(localizacao)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) {
      return
    }

    try {
      await deleteLocalizacao(id)
      await loadLocalizacoes()
      toast.success('Localização excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir localização:', error)
      toast.error('Erro ao excluir localização. Tente novamente.')
    }
  }

  return (
    <>
      <div className="localizacao">
        <div className="localizacao__header">
          <div>
            <h1>Localizações</h1>
            <p className="localizacao__subtitle">Gerencie as localizações de estoque</p>
          </div>
          <button className="localizacao__button-create" onClick={handleCreate}>
            <FaPlus size={16} />
            Nova Localização
          </button>
        </div>

        <div className="localizacao__content">
          <div className="localizacao__search">
            <div className="localizacao__search-input-wrapper">
              <FaSearch className="localizacao__search-icon" />
              <input
                type="text"
                className="localizacao__search-input"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="localizacao__loading">
              <p>Carregando localizações...</p>
            </div>
          ) : (
            <div className="localizacao__grid">
              {filteredLocalizacoes.length === 0 ? (
                <div className="localizacao__empty">
                  {searchTerm ? 'Nenhuma localização encontrada' : 'Nenhuma localização cadastrada'}
                </div>
              ) : (
                filteredLocalizacoes.map((localizacao) => (
                  <div key={localizacao.id} className="localizacao__card">
                    <div className="localizacao__card-header">
                      <div className="localizacao__card-icon">
                        <FaMapMarkerAlt size={24} />
                      </div>
                      <div className="localizacao__card-status">
                        <span className={`localizacao__status localizacao__status--${localizacao.ativo ? 'ativo' : 'inativo'}`}>
                          {localizacao.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="localizacao__card-body">
                      <h3 className="localizacao__card-title">{localizacao.nome}</h3>
                      {localizacao.descricao && (
                        <p className="localizacao__card-description">{localizacao.descricao}</p>
                      )}
                    </div>
                    <div className="localizacao__card-actions">
                      <button
                        className="localizacao__action-button localizacao__action-button--edit"
                        onClick={() => handleEdit(localizacao.id)}
                        title="Editar"
                      >
                        <FaEdit size={14} />
                        Editar
                      </button>
                      <button
                        className="localizacao__action-button localizacao__action-button--delete"
                        onClick={() => handleDelete(localizacao.id)}
                        title="Excluir"
                      >
                        <FaTrash size={14} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <CreateLocalizacaoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={loadLocalizacoes}
      />

      <EditLocalizacaoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedLocalizacao(null)
        }}
        onUpdate={loadLocalizacoes}
        localizacao={selectedLocalizacao}
      />
    </>
  )
}

export default Localizacao

