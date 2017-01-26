import Category from './category';

/**
 * Controller class for the Category model.
 * @private
 */
export default class CategoryController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * Create a category.
   *
   * @param {Category} category - Object to create.
   * @returns {Promise.<Category>} Promise containing the newly created Category.
   * @throws {Promise.<Error>} category parameter of type "Category" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createCategory(category) {
    if (!(category instanceof Category)) {
      return Promise.reject(new Error('category parameter of type "Category" is required'));
    }

    const url = this._connection._settings.apiUrl + '/categories';
    const fd = JSON.stringify(category);
    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new Category(data.id, data.parent, data.name, data.description, data.color,
          data.speechChallenges);
        result.imageUrl = data.imageUrl;
        result.iconUrl = data.iconUrl;
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a category.
   *
   * @param {string} categoryId - Specify a category identifier.
   * @returns {Promise.<Category>} Promise containing an Category.
   * @throws {Promise.<Error>} categoryId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getCategory(categoryId) {
    if (typeof categoryId !== 'string') {
      return Promise.reject(new Error('categoryId parameter of type "string" is required'));
    }

    const url = this._connection._settings.apiUrl + '/categories/' + categoryId;
    return this._connection._secureAjaxGet(url)
      .then(data => {
        const result = new Category(data.id, data.parent, data.name, data.description, data.color,
          data.speechChallenges);
        result.imageUrl = data.imageUrl;
        result.iconUrl = data.iconUrl;
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get and return all top level categories which do not have a parent Category.
   *
   * @returns {Promise.<Category[]>} Promise containing an array of Categories.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getTopLevelCategories() {
    return this.getCategories();
  }

  /**
   * Get and return all categories which have a specific category as parent.
   *
   * @param {string} parentId - Specify a category parent identifier.
   * @returns {Promise.<Category[]>} Promise containing an array of Categories.
   * @throws {Promise.<Error>} parentId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getCategoriesWithParent(parentId) {
    if (typeof parentId !== 'string') {
      return Promise.reject(new Error('parentId parameter of type "string" is required'));
    }
    return this.getCategories('/' + parentId + '/categories');
  }

  getCategories(urlModification = null) {
    let url = this._connection._settings.apiUrl + '/categories';
    if (urlModification !== null) {
      url += urlModification;
    }
    return this._connection._secureAjaxGet(url)
      .then(data => data.map(datum => {
        const category = new Category(datum.id, datum.parent, datum.name, datum.description, datum.color,
          datum.speechChallenges);
        category.imageUrl = datum.imageUrl;
        category.iconUrl = datum.iconUrl;
        category.created = new Date(datum.created);
        category.updated = new Date(datum.updated);
        return category;
      }));
  }
}
