/**
 * Class for comments in a Profile View
 */
export class Comment {
    _profileImg;
    _name;
    _date;
    _ratingValue;
    _comment;

    /**
     * Constructor to set Comment values
     * @param profileImg - The image of the profile
     * @param name - The profile's name
     * @param date - The date the comment was created
     * @param ratingValue - The rating value of the comment
     * @param comment - The text of the comment
     */
    constructor(profileImg, name, date, ratingValue, comment) {
      this._profileImg = profileImg;
      this._name = name;
      this._date = date;
      this._ratingValue = ratingValue;
      this._comment = comment;
    }

    /**
     * Gets the profile image
     * @returns The profile image in string
     */
    get profileImg() {
        return this._profileImg;
    }

    /**
     *
     * @returns The name of the profile that made the comment
     */
    get name() {
        return this._name;
    }

    get date() {
        return this._date;
    }

    get ratingValue() {
        return this._ratingValue;
    }

    get comment() {
        return this._comment;
    }
}