<template>
  <div class="about-author">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Об авторе</h1>
        <p class="page-subtitle">Информация о разработчике проекта</p>
      </div>

      <div class="content-grid">
        <!-- Основная информация -->
        <div class="content-card">
          <div class="card-header">
            <Icon name="user" size="24" />
            <h2>Основная информация</h2>
          </div>
          <div class="card-body">
            <div class="info-item">
              <span class="info-label">ФИО:</span>
              <span class="info-value">Мурашко Ольга Владимировна</span>
            </div>
            <div class="info-item">
              <span class="info-label">Учебная группа:</span>
              <span class="info-value">ДПИ23-1</span>
            </div>
            <div class="info-item">
              <span class="info-label">Учебное заведение:</span>
              <span class="info-value">
                Финансовый университет при Правительстве Российской Федерации (Финансовый университет)
              </span>
            </div>
          </div>
        </div>

        <!-- Научный руководитель -->
        <div class="content-card">
          <div class="card-header">
            <Icon name="graduation" size="24" />
            <h2>Научный руководитель</h2>
          </div>
          <div class="card-body">
            <div class="info-item">
              <span class="info-label">ФИО:</span>
              <span class="info-value">Бузыкова Юлия Сергеевна</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ученая степень и звание:</span>
              <span class="info-value">к. пед. н., доцент</span>
            </div>
          </div>
        </div>

        <!-- Сроки работы над проектом -->
        <div class="content-card">
          <div class="card-header">
            <Icon name="calendar" size="24" />
            <h2>Сроки работы над проектом</h2>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-date">25.10.2025</div>
                <div class="timeline-content">Начало работ над проектом</div>
              </div>
              <div class="timeline-item">
                <div class="timeline-date">18.10.2025</div>
                <div class="timeline-content">Завершение работ над проектом</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Технологии проекта -->
        <div class="content-card wide">
          <div class="card-header">
            <Icon name="code" size="24" />
            <h2>Технологии использованные в проекте</h2>
          </div>
          <div class="card-body">
            <p class="tech-description">
              Для решения поставленных задач были использованы следующие инструментальные средства и технологии:
            </p>
            
            <div class="tech-categories">
              <!-- Backend -->
              <div class="tech-category">
                <h3>Backend-разработка</h3>
                <ul class="tech-list">
                  <li>Язык программирования Java 17+</li>
                  <li>Фреймворк Spring Boot 3.x</li>
                  <li>Spring MVC</li>
                  <li>Spring Data JPA</li>
                  <li>Spring Security</li>
                  <li>Hibernate (реализация JPA)</li>
                  <li>Maven (сборка проекта)</li>
                </ul>
              </div>

              <!-- Базы данных -->
              <div class="tech-category">
                <h3>Базы данных</h3>
                <ul class="tech-list">
                  <li>PostgreSQL 17 (система управления базами данных)</li>
                  <li>pgAdmin 4 (администрирование БД)</li>
                </ul>
              </div>

              <!-- Frontend -->
              <div class="tech-category">
                <h3>Frontend-разработка</h3>
                <ul class="tech-list">
                  <li>Visual Studio Code (среда разработки)</li>
                  <li>Vue.js 3 (фреймворк)</li>
                  <li>HTML5 / CSS3 / JavaScript</li>
                  <li>Vue Router (маршрутизация)</li>
                  <li>Pinia (управление состоянием)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon.vue';
</script>

<style scoped>
.about-author {
  padding: var(--spacing-12) 0 var(--spacing-16);
  background: linear-gradient(135deg, 
    var(--color-gray-50) 0%, 
    var(--color-white) 50%, 
    var(--color-gray-50) 100%
  );
  min-height: calc(100vh - 200px);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-12);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-3);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  max-width: 600px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
}

.content-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
  transition: transform var(--transition-normal),
              box-shadow var(--transition-normal);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.content-card.wide {
  grid-column: 1 / -1;
}

.card-header {
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.card-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
}

.card-body {
  padding: var(--spacing-6);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--color-gray-800);
  line-height: 1.6;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
}

.timeline-date {
  min-width: 120px;
  padding: var(--spacing-2) var(--spacing-3);
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light));
  color: var(--color-primary-dark);
  font-weight: 600;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.timeline-content {
  flex: 1;
  padding: var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  color: var(--color-gray-700);
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.tech-description {
  color: var(--color-gray-700);
  line-height: 1.7;
  margin-bottom: var(--spacing-8);
  font-size: var(--font-size-lg);
}

.tech-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-8);
}

.tech-category h3 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-2);
  border-bottom: 2px solid var(--color-primary-light);
}

.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tech-list li {
  padding: var(--spacing-3) var(--spacing-4);
  margin-bottom: var(--spacing-2);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  color: var(--color-gray-800);
  font-size: var(--font-size-base);
  border-left: 3px solid var(--color-primary);
  transition: all var(--transition-fast);
}

.tech-list li:hover {
  background: var(--color-primary-light);
  transform: translateX(4px);
}

.tech-list li:last-child {
  margin-bottom: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
  
  .page-title {
    font-size: var(--font-size-2xl);
  }
  
  .tech-categories {
    grid-template-columns: 1fr;
    gap: var(--spacing-6);
  }
  
  .timeline-item {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .timeline-date {
    min-width: auto;
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .about-author {
    padding: var(--spacing-8) 0;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>