class ClientSpeedTest < ApplicationRecord
  has_one_attached :result
  belongs_to :widget_client, foreign_key: 'tested_by'
  belongs_to :autonomous_system, optional: true

  def as_json(options = nil)
    super(include: {
      autonomous_system: {
        except: %i[id autonomous_system_org_id created_at updated_at],
        include: {
          autonomous_system_org: {
            except: %i[id created_at updated_at]
          }
        }
      }
    })
  end
end
